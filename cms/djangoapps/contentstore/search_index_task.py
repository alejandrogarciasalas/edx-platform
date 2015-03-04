""" receiver of course_published / item_published events in order to trigger indexing task """
from django.dispatch import receiver
from celery.task import task
from xmodule.modulestore.django import modulestore, SignalHandler
from xmodule.modulestore.courseware_index import CoursewareSearchIndexer, SearchIndexingError
from celery.utils.log import get_task_logger

LOGGER = get_task_logger(__name__)


@receiver(SignalHandler.course_published)
def listen_for_course_publish(sender, course_key, **kwargs):  # pylint: disable=unused-argument
    """ Receives signal and kicks of celery task to update search index. """
    import pdb
    pdb.set_trace()
    update_search_index.delay(course_key)


@receiver(SignalHandler.item_published)
def listen_for_item_publish(sender, course_key, item_location, **kwargs):  # pylint: disable=unused-argument
    """ Receives signal and kicks of celery task to update search index. """
    import pdb
    pdb.set_trace()
    update_search_index.delay(course_key, item_location)


@task()
def update_search_index(course_key, item_location=None):
    """ Updates course search index. """
    try:
        index_location = course_key
        if item_location:
            index_location = item_location

        CoursewareSearchIndexer.add_to_search_index(modulestore(), index_location, delete=False, raise_on_error=True)
    except SearchIndexingError as exc:
        if item_location:
            LOGGER.error('Search indexing error for item %s in course %s - %r', item_location, course_key, exc)
        else:
            LOGGER.error('Search indexing error for course %s - %r', course_key, exc)
    else:
        if item_location:
            LOGGER.debug('Search indexing successful for item %s in course %s', item_location, course_key)
        else:
            LOGGER.debug('Search indexing successful for course %s', course_key)
