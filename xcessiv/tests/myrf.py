from sklearn.ensemble import RandomForestClassifier
import joblib


class MyClassifier(RandomForestClassifier):
    def save(self, filepath):
        joblib.dump(self, filepath, 3)

    @staticmethod
    def load(filepath):
        return joblib.load(filepath)
