---
layout: default
title: Posts
permalink: /posts
body_class: accent-blue
---

# Posts

<ul class="post-list">
  {% for post in site.posts %}
    <li class="post-list__item">
      <a href="{{post.url}}">{{post.date | date: "%Y-%m-%d"}} &raquo; {{post.title}}</a>
    </li>
  {% endfor %}
</ul>
