from __future__ import absolute_import, print_function, division, unicode_literals
import unittest
from sklearn.datasets import load_iris
from xcessiv import functions
from xcessiv.presets import cvsetting


class TestKFold(unittest.TestCase):
    def setUp(self):
        self.X, self.y = load_iris(return_X_y=True)

    def test_k_fold_source(self):
        module = functions.import_string_code_as_module(cvsetting.k_fold['source'])
        assert hasattr(module, 'return_splits_iterable')

        list(module.return_splits_iterable(self.X, self.y))

        del module


class TestStratifiedKFold(unittest.TestCase):
    def setUp(self):
        self.X, self.y = load_iris(return_X_y=True)

    def test_source(self):
        module = functions.import_string_code_as_module(cvsetting.stratified_k_fold['source'])
        assert hasattr(module, 'return_splits_iterable')

        list(module.return_splits_iterable(self.X, self.y))

        del module


class TestShuffleSplit(unittest.TestCase):
    def setUp(self):
        self.X, self.y = load_iris(return_X_y=True)

    def test_source(self):
        module = functions.import_string_code_as_module(cvsetting.shuffle_split['source'])
        assert hasattr(module, 'return_splits_iterable')

        list(module.return_splits_iterable(self.X, self.y))

        del module


class TestStratifiedShuffleSplit(unittest.TestCase):
    def setUp(self):
        self.X, self.y = load_iris(return_X_y=True)

    def test_source(self):
        module = functions.import_string_code_as_module(cvsetting.stratified_shuffle_split['source'])
        assert hasattr(module, 'return_splits_iterable')

        list(module.return_splits_iterable(self.X, self.y))

        del module


class TestLeaveOneOut(unittest.TestCase):
    def setUp(self):
        self.X, self.y = load_iris(return_X_y=True)

    def test_source(self):
        module = functions.import_string_code_as_module(cvsetting.leave_one_out['source'])
        assert hasattr(module, 'return_splits_iterable')

        list(module.return_splits_iterable(self.X, self.y))

        del module


class TestLeavePOut(unittest.TestCase):
    def setUp(self):
        self.X, self.y = load_iris(return_X_y=True)

    def test_source(self):
        module = functions.import_string_code_as_module(cvsetting.leave_p_out['source'])
        assert hasattr(module, 'return_splits_iterable')

        list(module.return_splits_iterable(self.X, self.y))

        del module


class TestGroupKFold(unittest.TestCase):
    def setUp(self):
        self.X, self.y = load_iris(return_X_y=True)

    def test_source(self):
        module = functions.import_string_code_as_module(cvsetting.group_k_fold['source'])
        assert hasattr(module, 'return_splits_iterable')

        generator = module.return_splits_iterable(self.X, self.y)
        self.assertRaises(
            ValueError,
            list,
            generator
        )

        del module


class TestTimeSeriesSplit(unittest.TestCase):
    def setUp(self):
        self.X, self.y = load_iris(return_X_y=True)

    def test_source(self):
        module = functions.import_string_code_as_module(cvsetting.leave_one_out['source'])
        assert hasattr(module, 'return_splits_iterable')

        list(module.return_splits_iterable(self.X, self.y))

        del module
