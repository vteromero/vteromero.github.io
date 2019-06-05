---
layout: post
title: A simple way to compress a sorted list of integers
---

I've been playing around with compression algorithms for a while now. I tried many different things, from well-known techniques to new algorithms. I failed plenty of times when trying new things, but I always got something valuable out of it.

One of the most important (yet obvious) things I learned is that any compressed data must be reversible in some way. Otherwise, it would be useless as you could not get the original input from the compressed output.

Sometimes you are so eager to try that fantastic and world-changing compression algorithm you just came up with that you don't pay much attention to the details. You might overlook the decompression process and make wrong assumptions about it. And you might end up having an amazing compression ratio and a pointless bunch of bits at the same time.

### A naive attempt

To illustrate the issue, let's start with an example.

Say you want to compress the next list of 8-bit integers:

*122, 14, 9, 233, 59, 44, 227*

First you want to see first what looks like in binary:

*01111010, 00001110, 00001001, 11101001, 00111011, 00101100, 11100011*

"Well, that's 56 bits for 7 items", you think.

Then, you wonder: "How could I compress that bunch of bits? Mmm... I need to basically represent those numbers with fewer bits. What if I get rid of the leading zeros? Let's see what the output looks like in binary".

*1111010, 1110, 1001, 11101001, 111011, 101100, 11100011*

"Amazing! Only 43 bits! That's 23% smaller than the original list!"

You are very excited and you rush to implement the algorithm, create some tests, measure the performance, and so on. Everything is going so well that you suddenly get that feeling that you must have made a huge mistake. And you are right. You completely forgot the decompression.

So, how could anyone decompress that stream of bits? Keep in mind that I added some commas to improve readability. In the "real world", a compressed chunk is just a sequence of bits with no breaks between elements. Therefore, it is impossible to recover the original information as there is no rule that tells you when an element starts and when it ends.

### Compressing a sorted list of integers

The previous example is kind of basic, but at the same time it is a good starting point to introduce the algorithm I'm going to describe. But, before I go into detail, let's define the input.

#### The input

Basically, as the title states, the input is a sorted list of integers. However, we will first focus on a specific version of it and then, we will generalise it. Initially, the input meets the following constraints:

* The order of the elements in the list is descending.
* The list only contains non-negative integers.

#### The algorithm

The idea behind this algorithm is to be close to encoding each integer with the minimum number of bits, or $$minBitsLen$$. That's somehow the same as what we tried in the introductory example. However, in this case there is a **context** that we can take advantage of: we know that every element on the list is always greater than or equal to the next one. That also means that at any position $$i$$ in the list $$l$$, $$minBitsLen(l[i])$$ is big enough to represent $$l[i+1]$$. With that in mind, we can encode each integer by using the value of $$minBitsLen$$ for the previous element:

```
algorithm "compress" is
  input: sorted list l
         word size W
  output: compressed stream s

  s <- {}
  w <- W

  for each a in l
    append w bits of a to s
    w <- minBitsLen(a)
```

Note that the first element is encoded with $$W$$ bits (the word size) as we do not have a previous $$minBitsLen$$ value.

The decompression algorithm looks something like this:

```
algorithm "decompress" is
  input: compressed stream s
         number of elements N
         word size W
  output: sorted list l

  l <- []
  w <- W

  for 1..N
    a <- read next w bits from s
    append a to l
    w <- minBitsLen(a)
```

#### An example

To make the algorithm even clearer, here is an example of how it works.

Suppose you have a list of 8-bit non-negative integers, sorted in descending order:

**<span style="color:tomato">177</span>, <span style="color:lightsalmon">102</span>, <span style="color:tomato">87</span>, <span style="color:lightsalmon">55</span>, <span style="color:tomato">30</span>, <span style="color:lightsalmon">25</span>, <span style="color:tomato">9</span>, <span style="color:lightsalmon">3</span>**

Applying the algorithm to that list and running it step by step will give you something like this:

1. The first integer **<span style="color:tomato">177</span>** is encoded with 8 bits, which is the value of the word size $$W$$.
2. Then, $$minBitsLen(177)$$ is called and it returns 8. So the second integer **<span style="color:lightsalmon">102</span>** is again encoded with 8 bits.
3. For the next integer **<span style="color:tomato">87</span>**, 7 bits are used as it is the returning value of $$minBitsLen(102)$$.
4. It continues this way until it reaches the end of the list. The remaining values **<span style="color:lightsalmon">55</span>, <span style="color:tomato">30</span>, <span style="color:lightsalmon">25</span>, <span style="color:tomato">9</span>, <span style="color:lightsalmon">3</span>** are coded with 7, 6, 5, 5 and 4 bits respectively.

Finally, this is the stream of bits generated after running the algorithm:

**<span style="color:tomato">10110001</span><span style="color:lightsalmon">01100110</span><span style="color:tomato">1010111</span><span style="color:lightsalmon">0110111</span><span style="color:tomato">011110</span><span style="color:lightsalmon">11001</span><span style="color:tomato">01001</span><span style="color:lightsalmon">0011</span>**

As you can see, the output is smaller than the input, so we have achieved some compression. The plain list is 64 bits long whereas the compressed one takes up 50 bits - that's roughly 22% smaller.

I am not going to go through the decompression algorithm as it is very similar to the compression one in the sense that both use the value of $$minBitsLen(prev)$$ to read from the input or to write onto the output.

### How about ascending order?

Even if the list is in ascending order, you will still need to encode the values in descending order. A solution would be to just add a flag that indicates the actual order of the list at the beginning of the compressed stream. One bit would be enough: 0 for ascending and 1 for descending.

### Dealing with negative values

One way to deal with negative values is to use [ZigZag encoding](https://developers.google.com/protocol-buffers/docs/encoding#types) as a previous step before applying the proposed algorithm. ZigZag encoding maps signed integers to unsigned integers so that the values (0, -1, 1, -2, 2, -3, 3, ...) are transformed to (0, 1, 2, 3, 4, 5, 6, ...). In other words, the negative inputs are mapped to odd outputs, and the non-negative inputs to even outputs, so the least-significant bit becomes a *sign bit*. Here's how the mapping is expressed:

$$
\begin{cases}
  x \mapsto 2x       & \quad \text{when } x \geq 0\\
  x \mapsto -2x - 1  & \quad \text{when } x < 0
\end{cases}
$$

Of course, the decompressor needs to undo this mapping as a last step.

### Pros & Cons

Here is a list of some of the strengths of this algorithm:

* It's easy to implement.
* It must be really fast when compressing and decompressing (pending tests).
* It will always produce an output smaller or equal to the input (headers apart).
* The compression ratio might be better than other algorithms in some kind of data distributions like a short list of sparse integers (pending tests).

And these are its weaknesses:

* The compression ratio does not seem very promising. In many situations, other algorithms can do better.
* It solves a specific case (sorted list of integers), it is not a general integer encoder.
* The decompressor must know the value of $$W$$, $$N$$ and the order of the list beforehand. Otherwise, that information must be included as a part of the output format.

### Conclusion

Although I have made some assumptions about the strengths of this algorithm, and they need to be proved, I am really confident of its **simplicity and speed**. Both compression and decompression algorithms are just a few lines long with no complicated calculations in it. Plus, considering that the complexity of $$minBitsLen$$ is constant, the algorithm runs in linear time with a complexity of $$O(n)$$, so it must be really quick.

Again, these are all gut feelings as I have not tested anything yet. I would like to come back to this algorithm and dig deeper. More posts will come!
