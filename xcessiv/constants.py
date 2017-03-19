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
        "base_learner_origins": [],
        "base_learner_origins_latest_id": 0,
        "base_learners": [],
        "base_learners_latest_id": 0
    },
    sort_keys=True,
    indent=1
)

DEFAULT_BASE_LEARNER_ORIGIN = {
    "source": [],
    "name": "",
    "meta_feature_generator": "predict_proba"
}
