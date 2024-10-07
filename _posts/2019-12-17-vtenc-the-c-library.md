---
layout: post
title: VTEnc, the C library
body_class: accent-blue
---

Somewhat more than a month ago, I published [VTEnc](https://github.com/vteromero/VTEnc), a C library that provides an interface to encode and decode sorted sequences of integers using the algorithm with the same name. After the first busy days and having published its second version already, I think it's the right time to write about the journey to bring the library out.

Back in July this year, I wrote an [article](https://vteromero.github.io/2019/07/28/vtenc.html) which presented a new integer compression algorithm. That was a huge milestone for me for a couple of reasons. First, I'm not an academic and therefore I'm not used to write with the formality and correctness required to describe a new algorithm. Second and not less important, all my research work is done in my free and scarce time. As a result, it took me several months to finish up the article and although it's far from following the standards of a scientific paper, I'm quite happy with the final result.

At the time, I thought that the natural next step after writing the article was sharing it with some experts in the subject and getting feedback about the algorithm. I knew the right place for that: [encode.su](https://encode.su/). So I opened a [thread](https://encode.su/threads/3155-VTEnc) in the forum and said "Hello everyone, I've created this new algorithm". And then, silence. I got just a couple of messages suggesting some existing projects to compare with. I was expecting to raise some discussions about the advantages and disadvantages of the algorithm, or perhaps someone would point out something wrong in it, or maybe some chats about use cases, or any other constructive comment/suggestion. But instead I got nothing back.

My plan was always to implement the algorithm and the lack of interest from the community wasn't going to discourage me from doing so. So I started building a library in C. I knew the language since I was a teenager, but I had never worked on any serious C project or hadn't produced production-ready code in C. There were a few things to learn/refresh and a few questions to answer along the way. Among those questions were things like:

* How do I create unit tests in C? Is there any 3rd party library I can use?
* Should I use 3rd party libraries at all?
* What's the best approach to implement generic code in C?
* Which version of C should I use?
* Which compilers should be supported? Which versions?
* Which operating systems should be supported?

It was a time of experimenting, learning, coding and testing. I really enjoyed it.

Three months later, I published an open source project on GitHub under MIT license. VTEnc v0.0.1 was out!

I was excited as I had a working library to show to the community. So I updated the thread on encode.su to let everyone know about it. And still nothing back. That was a moment of realisation that until I had showed some benchmark results I wouldn't receive any attention.

I decided to create a separate [repository](https://github.com/vteromero/integer-compression-benchmarks) for the benchmarks because I was going to use other integer compression libraries and wanted to keep VTEnc free of dependencies. I chose a [benchmarking library](https://github.com/google/benchmark), some algorithms to compare with and some datasets to run the tests against. I implemented the benchmarks and ran them. The first results were very promising, so I shared them with the community. And then, the project began raising interest: several comments on the mentioned thread, a few emails received, 21 stars earned on GitHub, etc. Overall, it was a positive reception.

One thing that came out after the initial benchmarking is that the encoding and decoding speed was way behind other integer algorithms. Since then, my focus has been on implementing some small changes to improve those key metrics. The just-released version v0.0.2 is on average about **1.4x** faster when encoding and decoding.

Now as Christmas time approaches, it's time to take a break, relax and think about next steps. Among other things, I have in mind a change on the encoded format that could potentially improve encoding and decoding speed. In a longer term, I would like to explore the possibility of adding support to bitmap operations. Once I've got a clearer idea what next versions will look like, I'll try to create a roadmap for the upcoming releases.

As usual, I'm open to hear any other ideas about the development of the library. And, of course, contributions are always welcomed.

Merry Christmas! 🎄 🎅
