import kachery_cloud as kcl
import time

print('a1')
f = kcl.create_feed()
print('a2')
print(f.uri)
kcl.set_mutable_local('_test_feed_uri', f.uri)

ct = 0
while True:
    print(f'Appending message {ct}')
    f.append_message({'ct': ct})
    ct = ct + 1
    time.sleep(4)