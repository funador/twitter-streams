from naiveBayesClassifier import tokenizer
from naiveBayesClassifier.trainer import Trainer
from naiveBayesClassifier.classifier import Classifier
import csv
import sys

sportsTrainer = Trainer(tokenizer)

with open('./utils/python-classifier/data.csv') as csvfile:
    sportsSet = csv.DictReader(csvfile)
    for article in sportsSet:
        sportsTrainer.train(article['text'], article['category'])

newsClassifier = Classifier(sportsTrainer.data, tokenizer)

toCheck = sys.argv[1]

classification = newsClassifier.classify(toCheck)

print classification
