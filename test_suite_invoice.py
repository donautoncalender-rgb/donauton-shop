import urllib.request

url = "https://donauton-suite.de/api/pdf/ecommerce/DTN-122094/invoice"
response = urllib.request.urlopen(url)
print(response.read(100))
