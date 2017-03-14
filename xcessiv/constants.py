import json


DEFAULT_NOTEBOOK = json.dumps(
    {
        "extraction": {
            "main_dataset":
                {
                    "source": []
                },
            "test_dataset":
                {
                    "method": None
                },
            "meta_feature_generation":
                {
                    "method": "cv",
                    "seed": 8,
                    "folds": 5
                }
        },
        "base_learner_classes": [],
        "base_learners": []
    },
    sort_keys=True,
    indent=1
)
