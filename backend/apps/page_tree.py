"""
Helpers for keeping Wagtail's page tree consistent when pages are created and
deleted through our own write APIs.

Background: django-treebeard only maintains a parent's ``numchild`` counter in
``MP_NodeQuerySet.delete()``, which is marked ``queryset_only``. Deleting a page
via the instance (``page.delete()``) therefore leaves the parent's ``numchild``
too high, and the next ``add_child()`` on that parent crashes with
``'NoneType' object has no attribute '_inc_path'``.
"""

from wagtail.models import Page


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
