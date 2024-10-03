---
layout: default
title: "Home"
body_class: accent-red
---

# Vicente Romero

Welcome to my personal website!

## Recent posts

<ul class="post-list">
  {% for post in site.posts limit:3 %}
    <li class="post-list__item">
      <a href="{{post.url}}">{{post.date | date: "%Y-%m-%d"}} &raquo; {{post.title}}</a>
    </li>
  {% endfor %}
</ul>

[&raquo; more posts]({{site.baseurl}}{% link posts.md%})
