import { randomAlphaString } from '../../core-utils';
import { Hyperlink } from '../../core-views';
import { getFileData, postMessageToParent, storeFileData, storeGithubFileData, useSignedIn } from "@fi-sci/figurl-interface";
import { Button } from "@material-ui/core";
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import EditGithubUriControl from './EditGithubUriControl';
import FormatUri from './FormatUri';

type Props ={
	fallbackUri?: string
	uri: string | undefined
	setUri: (uri: string) => void
	object: {[key: string]: any} | undefined
	setObject: (object: any) => void
}

type SaveState = {
	savedObjectJson?: string
	savedUri?: string
}

const SaveControl: FunctionComponent<Props> = ({fallbackUri, uri, setUri, object, setObject}) => {
	const [errorString, setErrorString] = useState<string>('')

	const [saving, setSaving] = useState<boolean>(false)

	const {userId} = useSignedIn()

	const [saveState, setSaveState] = useState<SaveState>({})

	const handleSaveSnapshot = useCallback(() => {
		if (!object) return
		const x = JSONStringifyDeterministic(object)
		setSaving(true)
		setErrorString('')
		;(async () => {
			try {
				const newUri = await storeFileData(x)
				setUri(newUri)
				setSaveState({
					savedObjectJson: x,
					savedUri: newUri
				})
			}
			catch(err: any) {
				setErrorString(`Problem saving file data: ${err.message}`)
			}
			finally {
				setSaving(false)
			}
		})()
	}, [object, setUri])

	const handleSaveJot = useCallback((o: {new?: boolean}={}) => {
		if (!object) return
		const jotId = uri && uri.startsWith('jot://') && (!o.new) ? uri.split('?')[0].split('/')[2] : randomAlphaString(12)
		const x = JSONStringifyDeterministic(object)
		setSaving(true)
		setErrorString('')
		;(async () => {
			try {
				await storeFileData(x, {jotId})
				const newUri = `jot://${jotId}`
				setUri(newUri)
				setSaveState({
					savedObjectJson: x,
					savedUri: newUri
				})
			}
			catch(err: any) {
				setErrorString(`Problem saving file data: ${err.message}`)
			}
			finally {
				setSaving(false)
			}
		})()
	}, [object, setUri, uri])

	const handleSaveGithub = useCallback(() => {
		if (!object) return
		if (!uri) return
		const x = JSONStringifyDeterministic(object)
		setSaving(true)
		setErrorString('')
		;(async () => {
			try {
				await storeGithubFileData({fileData: x, uri})
				setSaveState({
					savedObjectJson: x,
					savedUri: uri
				})
			}
			catch(err: any) {
				setErrorString(`Problem saving file data to Github: ${err.message}`)
			}
			finally {
				setSaving(false)
			}
		})()
	}, [object, uri])

	const handleSaveGithubAs = useCallback((newUri: string) => {
		if (!object) return
		const x = JSONStringifyDeterministic(object)
		setSaving(true)
		setErrorString('')
		;(async () => {
			try {
				await storeGithubFileData({fileData: x, uri: newUri})
				setSaveState({
					savedObjectJson: x,
					savedUri: newUri
				})
				setUri(newUri)
			}
			catch(err: any) {
				setErrorString(`Problem saving file data to Github: ${err.message}`)
			}
			finally {
				setSaving(false)
				setEditingGithubUri(false)
			}
		})()
	}, [object, setUri])

    ///////////////////////////////////////////////////////////////
	const first = useRef<boolean>(true)
	useEffect(() => {
		if (!first.current) return
		if (uri) {
			getFileData(uri, 'json-deserialized', () => {}).then((x) => {
				if (!x) {
					console.warn('Empty state')
					return
				}
				setObject(x)
				setSaveState({
					savedObjectJson: JSONStringifyDeterministic(x),
					savedUri: uri
				})
			}).catch((err: Error) => {
				if (fallbackUri) {
					getFileData(fallbackUri, 'json-deserialized', () => {}).then((y) => {
						if (!y) {
							console.warn('Empty state 2')
							return
						}
						setErrorString(`Unable to load primary URI (${uri}), using fallback (${fallbackUri})`)
						setObject(y)
						setSaveState({
							savedObjectJson: JSONStringifyDeterministic(y),
							savedUri: fallbackUri
						})
					}).catch((err2: Error) => {
						console.warn('Problem getting state 2')
						console.warn(err2)
						setErrorString(`Error getting ${fallbackUri}`)
					})
				}
				else {
					console.warn('Problem getting state')
					console.warn(err)
					setErrorString(`Error getting ${uri}`)
				}

			})
		}
		first.current = false
	}, [uri, first, setObject, fallbackUri])

	const uriStartsWithJot = (uri || '').startsWith('jot://')
	const uriStartsWithGithub = (uri || '').startsWith('gh://')
	const jotId = uriStartsWithJot ? (uri || '').split('?')[0].split('/')[2] : ''
	const buttonStyle: React.CSSProperties = useMemo(() => ({textTransform: 'none'}), [])

	const dirty = useMemo(() => {
		if ((uri === saveState.savedUri) && (JSONStringifyDeterministic(object || {}) === saveState.savedObjectJson)) {
			return false
		}
		return true
	}, [object, saveState, uri])

	const saveAsJotEnabled = useMemo(() => {
		if (saving) return false
		if (!userId) return false
		if (!uri?.startsWith('jot://')) return false
		if (!dirty) return false
		return true
	}, [uri, saving, userId, dirty])

	const saveSnapshotEnabled = useMemo(() => {
		if (saving) return false
		if (((uri || '').startsWith('sha1://')) && (uri === saveState.savedUri) && (JSONStringifyDeterministic(object || {}) === saveState.savedObjectJson)) {
			return false
		}
		return true
	}, [uri, object, saveState, saving])

	// const saveAsNewJotEnabled = useMemo(() => {
	// 	if (saving) return false
	// 	if (!userId) return false
	// 	return true
	// }, [saving, userId])

	useEffect(() => {
		const listener = (e: BeforeUnloadEvent) => {
			if (!saveAsJotEnabled) {
				return undefined
			}
			e.preventDefault()
			e.returnValue = ''
		}
		window.addEventListener("beforeunload", listener)
		return () => {
			window.removeEventListener("beforeunload", listener)
		}
	}, [saveAsJotEnabled])

	const handleExportAsJson = useCallback(() => {
		if (!object) return
		const x = JSONStringifyDeterministic(object)
		downloadTextFile('sorting-curation.json', x)
	}, [object])

	const [editingGithubUri, setEditingGithubUri] = useState(false)

	const handleSubmitToParent = useCallback(() => {
		postMessageToParent({type: 'submit-curation', curation: object})
	}, [object])

	return (
		<div>
			<div>
				{
					uriStartsWithJot && (
						<span>
							<Button style={{...buttonStyle, color: saveAsJotEnabled ? 'green' : 'gray'}} disabled={!saveAsJotEnabled} title={`Save as ${jotId}`} onClick={() => handleSaveJot({new: false})}>SAVE JOT</Button>
							<br />
							<span style={{paddingLeft: 9}}>
								{
									userId && (
										<span>
											<Hyperlink href={`https://jot.figurl.org/jot/${jotId}`} target="_blank"><span style={{fontSize: 12}}>manage jot access</span></Hyperlink>
											<br />
										</span>
									)
								}
							</span>
						</span>
					)
				}
				{
					uriStartsWithGithub && (
						<span>
							<Button disabled={!dirty} style={buttonStyle} onClick={() => handleSaveGithub()}>Save to GitHub</Button>
						</span>
					)
				}
				<Button style={buttonStyle} disabled={!saveSnapshotEnabled} onClick={handleSaveSnapshot}>Save as snapshot (sha1://)</Button>
				{/* {
					!uriStartsWithJot && (
						<span>
							<Button style={buttonStyle} disabled={!saveAsNewJotEnabled} onClick={() => handleSaveJot({new: true})}>Save as new jot (jot://)</Button>
							<br />
						</span>
					)
				} */}
				<Button style={buttonStyle} onClick={handleSubmitToParent}>Submit to parent</Button>
				{
					!editingGithubUri ? (
						<span>
							<Button style={buttonStyle} onClick={() => setEditingGithubUri(true)}>Save to Github as...</Button>
							<br />
						</span>
					) : (
						<EditGithubUriControl
							initialValue={uri || ''}
							onSubmit={uri => {handleSaveGithubAs(uri)}}
							onCancel={() => setEditingGithubUri(false)}
						/>
					)
				}
				<span>
					<Button style={buttonStyle} onClick={handleExportAsJson}>Export as JSON</Button>
					<br />
				</span>
				{
					saving && 'Saving...'
				}
				{
					!userId && <span style={{fontStyle: 'italic', color: 'gray'}}>You are not signed in</span>
				}

				<div style={{paddingLeft: 8, fontSize: 12}}>
					URI: <FormatUri uri={uri} />
				</div>

			</div>
			{errorString && <div style={{color: 'red'}}>{errorString}</div>}
		</div>
	)
}

// Thanks: https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
export const JSONStringifyDeterministic = ( obj: object, space: string | number | undefined =undefined ) => {
    const allKeys: string[] = [];
    JSON.stringify( obj, function( key, value ){ allKeys.push( key ); return value; } )
    allKeys.sort();
    return JSON.stringify( obj, allKeys, space );
}

// Thanks: https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
function downloadTextFile(filename: string, text: string) {
	const element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

export default SaveControl
