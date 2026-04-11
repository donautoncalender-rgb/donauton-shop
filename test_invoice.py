import urllib.request
import urllib.error

url = "https://donauton-shop.vercel.app/api/customer/invoice?email=l.bruckmeyer@donauton.de&orderId=DTN-122094"
try:
    response = urllib.request.urlopen(url)
    print("Status:", response.status)
    print(response.read(100))
except urllib.error.HTTPError as e:
    print("Failed with status:", e.code)
    print(e.read())
