"""This module contains RQ jobs"""
from rq.decorators import job
from rq import get_current_job
from xcessiv import redis_conn
from xcessiv import functions
from xcessiv import parsers
from xcessiv import exceptions


@job('default', connection=redis_conn, timeout=86400)
def generate_meta_features(path, base_learner_id):
    """Generates meta-features for specified base learner

    Args:
        path (str): Path to Xcessiv notebook

        base_learner_id (str): Base learner ID
    """
    xcnb = functions.read_xcnb(path)
    base_learner = None
    for bl in xcnb['base_learner_origins']:
        if bl['id'] == base_learner_id:
            base_learner = bl
            break
    if base_learner is None:
        return None
    base_learner['job_id'] = get_current_job()
    base_learner['status'] = 'STARTED'
    functions.write_xcnb(path, xcnb)
