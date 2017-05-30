from sklearn.datasets import load_digits


def extract_main_dataset():
    X, y = load_digits(return_X_y=True)
    return X, y

dummy_variable = 2
