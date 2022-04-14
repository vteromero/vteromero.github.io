---
layout: post
title: Encoding parameters in VTEnc library
---

[VTEnc v0.2.0](https://github.com/vteromero/VTEnc/blob/master/CHANGELOG.md#v020) is the biggest release of the library to date. It brings in several changes aiming to simplify the API, changes on the encoding data format, the new encoder and decoder structures, etc. But, above all those things, the most important feature is perhaps the inclusion of **encoding parameters**.

Encoding parameters give users the ability to choose how to encode any list of integers. Different combinations of values for the encoding parameters will result in different encoding speeds and compression ratios. Usually, that relation is inversely proportional, so the more compression you get, the slower the process is; and vice versa.

There are 3 encoding parameters: `allow_repeated_values`, `skip_full_subtrees` and `min_cluster_length`. They're part of the `VtencEncoder` and `VtencDecoder` structures, which are arguments of the `vtenc_encode`* and `vtenc_decode`* functions, respectively.

## allow_repeated_values

This flag tells whether repeated values in the sequence to be encoded are allowed or not. It's used for 2 purposes:

1. To set the **maximum input size**. This value also depends on the bitwidth of the sequence's data type and it's set according to the following table:

   |                               |8 bits|16 bits|32 bits|64 bits|
   |:-----------------------------:|:----:|:-----:|:-----:|:-----:|
   |**`allow_repeated_values` = 1**|$$2^{57}-1$$|$$2^{57}-1$$|$$2^{57}-1$$|$$2^{57}-1$$|
   |**`allow_repeated_values` = 0**|$$2^8$$|$$2^{16}$$|$$2^{32}$$|$$2^{57}-1$$|

2. To enable or disable `skip_full_subtrees` parameter. `skip_full_subtrees` is only applicable to sets, i.e. sequences that have no repeated values. So if `allow_repeated_values` is true, `skip_full_subtrees` will be ignored.

## skip_full_subtrees

This boolean parameter indicates whether to skip encoding full subtrees or not.

Here, a full subtree is a subtree of the Bit Cluster Tree in which every node has exactly a value of $$2^{Lvl}$$, $$Lvl$$ being the node's tree level.

Here's an example:

{:refdef: style="text-align: center;"}
![VTEnc full subtree example](/img/vtenc-full-subtree.png){:width="500px"}
{: refdef}

The subtree enclosed in a blue square is indeed a full subtree as all its nodes meet the explained criteria. It has:
* One node at level 2, with value $$2^2 = 4$$.
* Two nodes at level 1, each with value $$2^1 = 2$$.
* Four nodes at level 0, each with value $$2^0 = 1$$.

This definition of full subtree is specially interesting if the input sequence is a set. Sets have a couple of related characteristics:
1. $$2^{Lvl}$$ is the maximum possible value for any node at level $$Lvl$$.
2. As a consequence of (1), if a node $$N$$ at level $$Lvl$$ has the maximum possible value, all nodes in the subtree in which $$N$$ is the root node will also have the maximum possible value for the level they are in. Thus, if the value of node $$N$$ is $$2^{Lvl}$$, its two children nodes will be each $$\frac{2^{Lvl}}{2}=2^{Lvl-1}$$, its four grandchildren nodes will be each $$\frac{2^{Lvl}}{4}=\frac{2^{Lvl-1}}{2}=2^{Lvl-2}$$, and so on.

The above can be summarised in the following sentence: if you know that a node has its maximum possible value, you also know the values of the nodes below it in the tree.

Therefore, when serialising the Bit Cluster Tree of a set, if a node's value is equal to $$2^{Lvl}$$, the rest of its subtree can be skipped from being visited and hence serialised. A decoder will have enough context to reconstruct that full subtree just with the value of its root node. This is also possible since the tree serialisation follows a pre-order schema, which traverses the tree in depth from root down to leaf nodes.

`skip_full_subtrees` parameter enables the exposed functionality of omitting full subtrees' "non-root" nodes from being serialised. This potentially improves compression ratio.

## min_cluster_length

This numeric parameter sets the minimum cluster length to be serialised.

In the Bit Cluster Tree serialisation phase, when a tree node $$N$$ has a value (or cluster length) less than or equal to `min_cluster_length`, that node will be the last one to be visited for the subtree in which $$N$$ is the root node. Immediately after $$N$$ is serialised, lower bits of the values that belong to that subtree will be encoded.

Consider the list of 3-bit integers [0, 1, 3, 5]. The following figure shows 2 different representations of it, used internally by VTEnc: binary table and Bit Cluster Tree.

{:refdef: style="text-align: center;"}
![VTEnc min_cluster_length example 1](/img/vtenc-min-cluster-length-1.png)
{: refdef}

Suppose you want to encode that list with `min_cluster_length` = 3.

The tree serialisation would begin from the root node and then it'd move to its left child, the node with value 3 at level 2. As the node's value is equal to `min_cluster_length`, the remaining nodes in that subtree (purple square in the figure below) wouldn't be visited. Instead, the corresponding lower bits in the binary table (purple square too) would be encoded. Then, the tree traversing process would continue from where it was, jumping to the node with value 1 at level 2. That node's value is less than `min_cluster_length`, so it'd be serialised and, then, its subtree would be skipped from being visited. Its corresponding bits from the binary table (green square) would be encoded instead.

{:refdef: style="text-align: center;"}
![VTEnc min_cluster_length example 2](/img/vtenc-min-cluster-length-2.png)
{: refdef}

The encoded output would look like this:

{:refdef: style="text-align: center;"}
![VTEnc min_cluster_length example 3](/img/vtenc-min-cluster-length-3.png)
{: refdef}

Of course, that's not the real output, but rather a simplified version of it. However, it serves to illustrate how VTEnc alternates tree serialisation with encoding lower bits from the binary table, depending on if a tree node's value has reached `min_cluster_length`.

This encoding parameter aims to improve encoding speed since encoding lower bits from the binary table is usually faster than traversing the Bit Cluster Tree.
