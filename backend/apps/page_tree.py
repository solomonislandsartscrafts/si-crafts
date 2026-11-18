"""
Helpers for keeping Wagtail's page tree consistent when pages are created and
deleted through our own write APIs.

Background: django-treebeard only maintains a parent's ``numchild`` counter in
``MP_NodeQuerySet.delete()``, which is marked ``queryset_only``. Deleting a page
via the instance (``page.delete()``) therefore leaves the parent's ``numchild``
too high, and the next ``add_child()`` on that parent crashes with
``'NoneType' object has no attribute '_inc_path'``.
"""

from django.utils.text import slugify
from wagtail.models import Page


def unique_slug(parent, wanted, exclude_pk=None, fallback="page"):
    """Return a slug no sibling under ``parent`` is using.

    Wagtail requires sibling pages to have different slugs and raises a
    ValidationError otherwise. The admin forms build the slug from the name,
    and names repeat (a maker's second "Shoulder Bag"), so a clash gets
    -2, -3, ... instead of failing.
    """
    base = slugify(wanted or "") or fallback
    siblings = Page.objects.child_of(parent)
    if exclude_pk:
        siblings = siblings.exclude(pk=exclude_pk)
    taken = set(siblings.filter(slug__startswith=base).values_list("slug", flat=True))
    slug, n = base, 2
    while slug in taken:
        slug = f"{base}-{n}"
        n += 1
    return slug


def repair_numchild(parent):
    """Correct ``parent.numchild`` if it disagrees with the actual child count."""
    actual = parent.get_children().count()
    if parent.numchild != actual:
        Page.objects.filter(pk=parent.pk).update(numchild=actual)
        parent.refresh_from_db()
    return parent


def delete_page(page):
    """Delete a page via the queryset so treebeard keeps ``numchild`` in step."""
    Page.objects.filter(pk=page.pk).delete()
