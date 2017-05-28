from xcessiv.presets.cvsetting import k_fold


extraction_default_source = """\"\"\"In this code block, you must define the function `extract_{}_dataset`.
`extract_{}_dataset` must take no arguments and return a tuple (X, y), where X is a
Numpy array with shape (n_samples, n_features) corresponding to the features of your
{} dataset and y is the Numpy array corresponding to the ground truth labels of each
sample.
\"\"\"

def extract_{}_dataset():
    return [[1, 2], [2, 1]], [0, 1]
"""

meta_feature_generation_default_source = k_fold['source']

DEFAULT_EXTRACTION_MAIN_DATASET = {
    "source": extraction_default_source.format('main', 'main', 'main', 'main')
}
DEFAULT_EXTRACTION_TEST_DATASET = {
    "method": None,
    "source": extraction_default_source.format('test', 'test', 'test', 'test')
}
DEFAULT_EXTRACTION_META_FEATURE_GENERATION = {
    "source": meta_feature_generation_default_source
}
