---
layout: post
title: Benchmarking a simple integer compression algorithm
---

In my [last post](https://vteromero.github.io/simple-integer-list-compression/), I described an integer compression algorithm (Simple, from now on) that can be easily implemented in just a few lines of code. I also wrote about its possible strengths and weaknesses, but just as an exercise of pure intuition. In this post, I am going to show you the results I have got by testing and benchmarking the algorithm.

I have written a quick [prototype](https://github.com/vteromero/playground/tree/master/simple-integer-list-compression) in Go to check and challenge my assumptions about the algorithm. It comprises of a library which implements it, some benchmarks to measure the compression and decompression **speed** and a command-line tool to test the **compression ratio**.

I chose Go for no particular reason, apart from the fact that I am familiar with the language and because it is quite easy to create tests and benchmarks with it.

Both the benchmarks and the command-line tool do not just run Simple in isolation, but comparing it against other existing compression techniques. In particular, both execute as well a general-purpose compression library ([Zlib](https://en.wikipedia.org/wiki/Zlib) through [compress/zlib](https://golang.org/pkg/compress/zlib/) package) and a couple of integer compression algorithms: [FastPFor](https://github.com/lemire/FastPFor) and [Bit Packing](https://lemire.me/blog/2012/03/06/how-fast-is-bit-packing/), which are included in [this](https://github.com/dataence/encoding) library. This two last methods are also expanded with [delta encoding](https://en.wikipedia.org/wiki/Delta_encoding). So the final list of compression algorithms is: Simple, Zlib, FastPFor, BP32, DeltaFastPFor and DeltaBP32.

Uniformly distributed random values has been employed as input for the compression algorithms. To generate them, I have used the [math/rand](https://golang.org/pkg/math/rand/) package, which provides plenty of functions that yield this type of random numbers (as it is explained [here](https://appliedgo.net/random/)). Once generated, the values were also sorted in ascending order, resulting in a sorted sequence of 32-bit random integers.

I have tried to feed the algorithms with the same exact data, but it has been impossible since I have had to deal with different types of input. For instance, Zlib works with `[]byte`, whereas the other integer compression methods expect either `[]int32` or `[]uint32`. So, I ended up having to make some transformations in order to get a set of inputs as similar as possible.

### Results

##### Environment

The following results have been got on a laptop Ubuntu Desktop 18.10 with a Core i7-6700HQ CPU @ 2.60GHz x 8. You might get different values on a different environment setup, but they should be similar in terms of comparing them to one another.

##### Compression and decompression speed

Here is the outcome for the benchmarks:

```
BenchmarkCompressSimple-8            	      10	 105658901 ns/op
BenchmarkCompressZlib-8              	       5	 335552325 ns/op
BenchmarkCompressBP32-8              	     100	  19725261 ns/op
BenchmarkCompressFastpfor-8          	      20	  77703391 ns/op
BenchmarkCompressDeltaBP32-8         	      50	  24439807 ns/op
BenchmarkCompressDeltaFastpfor-8     	      10	 119863099 ns/op
BenchmarkDecompressSimple-8          	      10	 104063865 ns/op
BenchmarkDecompressZlib-8            	       2	 729746805 ns/op
BenchmarkDecompressBP32-8            	     100	  13691662 ns/op
BenchmarkDecompressFastpfor-8        	     100	  14427686 ns/op
BenchmarkDecompressDeltaBP32-8       	     100	  14145599 ns/op
BenchmarkDecompressDeltaFastpfor-8   	      50	  27173598 ns/op
```

In the compression side, Simple is clearly slower than BP32, FastPFor and DeltaBP32. However, it is slightly faster than DeltaFastPFor and 3x faster than Zlib.

In terms of decompression speed, Simple is much worse than the other specialised integer compression methods. Nonetheless, compared to Zlib, it is 7x faster.

##### Compression ratio

As I mentioned earlier, I have created a small command-line tool, called `compare-compression-ratio`, as part of the prototype. Its purpose is to run the set of algorithms with different inputs of different sizes, and then to show the compression ratio for each case. It displays the results in the form of a table, so that it is quite easy to determine at a glance which methods get the best compression ratio.

Running the program for the list of sizes `10,100,1000,10000,100000,1000000` will give you the following output:

```
      integers     10    100   1000   10000   100000   1000000
         bytes   1.00   1.00   1.00    1.00     1.00      1.00
        simple   0.95   1.05   1.07    1.07     1.07      1.07
          zlib   0.75   0.96   1.00    1.01     1.08      1.17
          bp32   0.77   0.81   1.02    1.06     1.06      1.06
    delta bp32   0.83   1.01   1.32    1.57     1.87      2.32
      fastpfor   0.77   0.81   1.02    1.06     1.06      1.06
delta fastpfor   0.83   1.01   1.33    1.60     1.92      2.39
```

The first two lines are informative. One is telling the actual input size. The other is there to establish a baseline for comparison: the output of uncompressed data.

As you can see, the compression ratios for the Simple algorithm are somewhat better than BP32 and FastPFor. Yet far from the results of DeltaBP32, DeltaFastPFor and even Zlib, for almost all input sizes, except for the smallest ones.

### The case for small data

When I was carrying out the tests, I soon realised that there is a use case in which Simple outperforms the rest of methods: small data. Small data refers here to a short sequence of just a few values, something around 100 integers or fewer. At that scale, Simple is better in terms of compression ratio.

Let's run `compare-compression-ratio` with small data:

```
         integers      5     10     20     30     40     50     80    100    150
            bytes   1.00   1.00   1.00   1.00   1.00   1.00   1.00   1.00   1.00
           simple   0.83   0.95   1.00   1.02   1.02   1.05   1.06   1.05   1.05
             zlib   0.62   0.74   0.85   0.88   0.91   0.93   0.95   0.96   0.97
             bp32   0.62   0.77   0.77   0.79   0.78   0.81   0.82   0.81   0.99
       delta bp32   0.71   0.83   0.95   0.97   0.98   1.00   1.00   1.01   1.17
         fastpfor   0.62   0.77   0.77   0.79   0.78   0.81   0.82   0.81   0.96
   delta fastpfor   0.71   0.83   0.95   0.97   0.98   1.00   1.00   1.01   1.14
```

Since the compression ratio is around 1.0 and the overall gain is poor (just a few bytes at most), it is probably more useful to look at the plain output size instead. `compare-compression-ratio` lets you display the results in that way. This is how it looks like when running the program for the same sizes:

```
      integers    5   10    20    30    40    50    80   100   150
         bytes   20   40    80   120   160   200   320   400   600
        simple   24   42    80   118   157   191   303   381   569
          zlib   32   54    94   136   176   216   336   416   616
          bp32   32   52   104   152   204   248   388   492   604
    delta bp32   28   48    84   124   164   200   320   396   512
      fastpfor   32   52   104   152   204   248   388   492   628
delta fastpfor   28   48    84   124   164   200   320   396   528
```

With just a handful of values, Simple achieves some compression, i.e. the output size is less than the input size. For example, we save 2 bytes with 30 integers, 9 bytes with 50, 17 bytes with 80, and so on. For any of the other methods, you need to move to an input size of 100 integers to see a tiny gain.

However, if you look at the results of the first columns on the Simple row, you will still see output sizes greater than their input sizes. The good news here are that we can do better.

By default, `compare-compression-ratio` adds a 32-bit header to indicate the length of the compressed sequence. Those 32 bits seem excessive to me for such a short sequence. If we cut down the header to 8 bits, Simple can still compress a list of up to 255 values, which is more than enough for our definition of small data. Here is the resulting table when using a 8-bit header:

```
         integers    5   10    20    30    40    50    80   100   150
            bytes   20   40    80   120   160   200   320   400   600
           simple   21   39    77   115   154   188   300   378   566
             zlib   32   54    94   136   176   216   336   416   616
             bp32   32   52   104   152   204   248   388   492   604
       delta bp32   28   48    84   124   164   200   320   396   512
         fastpfor   32   52   104   152   204   248   388   492   628
   delta fastpfor   28   48    84   124   164   200   320   396   528
```

At some point between input sizes of 5 and 10, we start compressing. It is not bad at all.

### Conclusion

In general, Simple is slower than FastPFor, BP32 and their delta versions. This may be mainly because those algorithms are optimised to be fast and Simple is just a prototype. That doesn't mean that Simple will beat them eventually, but rather that there is still a lot of room for improvement.

With regards to the compression level, Simple mostly doesn't get close to the results obtained by Zlib, DeltaBP32 and DeltaFastPFor. The compression ratio flattens when reaching input sizes of around 1000. However, it gets amazing results for small data, as we have covered in the previous point.

I started writing this post (and the previous one) with the sole goal of exploring a pretty elementary technique. There was no expectations beyond some thoughts about how it would perform. Simple has turned out to be a great integer compression method, especially for small inputs. So overall, I am very satisfied with what I have found.
