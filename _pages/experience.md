---
layout: archive
title: "Work Experience"
permalink: /experience/
author_profile: true
---

{% include base_path %}

{% for post in site.experience %}
  {% include archive-single.html %}
{% endfor %}