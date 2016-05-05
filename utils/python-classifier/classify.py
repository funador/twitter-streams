from naiveBayesClassifier import tokenizer
from naiveBayesClassifier.trainer import Trainer
from naiveBayesClassifier.classifier import Classifier
import csv
import sys

newsTrainer = Trainer(tokenizer)

with open('./utils/python-classifier/data.csv') as csvfile:
    newsSet = csv.DictReader(csvfile)
    for news in newsSet:
        newsTrainer.train(news['text'], news['category'])

newsClassifier = Classifier(newsTrainer.data, tokenizer)

unknownInstance = sys.argv[1]
# toCheck = unknownInstance.read()

classification = newsClassifier.classify(unknownInstance)

print classification
