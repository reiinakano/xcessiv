# Xcessiv

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()
[![Build Status](https://travis-ci.org/reiinakano/scikit-plot.svg?branch=master)](https://travis-ci.org/reiinakano/scikit-plot)

### Xcessiv is a tool to help you create the biggest, craziest, and most *excessive* stacked ensemble models you can think of.

Stacked ensembles are simple in theory. You combine the predictions of smaller models and feed *those* into another model. However, in practice, implementing and optimizing them can be a major headache.

Xcessiv holds your hand through all the implementation details of creating a stacked ensemble so you're free to fully define only the things you care about.

## The Xcessiv process

### Define your base learners and performance metrics

<gif here>

### Keep track of hundreds of different hyperparameter combinations

<gif here>

### Effortlessly choose your base learners and create an ensemble with the click of a button

<gif here>

## Installation

I wish I could say you can just type in `pip install xcessiv`. I really do.

Unfortunately, Xcessiv requires a bit more than that. Head on over to the official documentation for installation instructions.

## Documentation

The official documentation is located here.

## FAQ

#### Where does Xcessiv fit in the machine learning process?

Xcessiv fits in the model building part of the process after data preparation and feature engineering. At this point, there is no universally acknowledged way of determining which algorithm will work best for a particular dataset (see [No Free Lunch Theorem](https://en.wikipedia.org/wiki/No_free_lunch_theorem)), and things often break down into trial and error. Xcessiv makes this trial and error part bearable.

#### I don't care about fancy stacked ensembles and what not, should I still use Xcessiv?

Absolutely! Even without the ensembling functionality, the sheer amount of utility provided by keeping track of the performance of hundreds, and even thousands of ML models and hyperparameter combinations is a huge boon.

## Project Status

Xcessiv is currently in pre-release and is unstable. Future versions are not guaranteed to be backwards-compatible with current project files.
