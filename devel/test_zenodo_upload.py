import kachery_cloud as kcl


uri = 'sha1://3ee2df1ea84baa665ffe9f6ea7ee4cafe1d730c4'

uploader = kcl.initiate_zenodo_upload(
    author='Jeremy Magland',
    affiliation='Flatiron Institute',
    title='First zenodo figURL',
    description='First example of a figURL where the data is hosted entirely on zenodo.',
    sandbox=True
)

uri2 = uploader.upload_file_recursive(uri, name='main')
print(uri2)

uploader.finalize_upload()

print(uri2)