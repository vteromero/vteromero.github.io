---
layout: default
title: "Home"
---

# Vicente Romero

Welcome to my personal website!

## Recent posts

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{post.url}}">{{post.title}}</a>
    </li>
  {% endfor %}
</ul>
