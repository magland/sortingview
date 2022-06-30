import kachery_cloud as kcl


uri = kcl.get_mutable_local('_test_feed_uri')
f = kcl.load_feed(uri)

while True:
    m = f.get_next_messages(timeout_sec=10)
    print(m)