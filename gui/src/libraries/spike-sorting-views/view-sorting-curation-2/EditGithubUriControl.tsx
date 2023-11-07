import { useSignedIn } from "@figurl/interface";
import { Button, Input } from "@material-ui/core";
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";

type Props ={
	initialValue: string
	onSubmit: (uri: string) => void
	onCancel: () => void
}

const EditGithubUriControl: FunctionComponent<Props> = ({onSubmit, onCancel, initialValue}) => {
	const [value, setValue] = useState('')
	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])
	const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback((e) => {
        setValue(e.target.value as string)
    }, [])
	const valid = useMemo(() => {
		if (!value.startsWith('gh://')) return false
		if (value.split('/').length < 6) return false
		return true
	}, [value])
	const {userId} = useSignedIn()
	const handleAppendUserId = useCallback(() => {
		const a = value.split('/')
		if (a.length === 0) return
		const b = a[a.length - 1]
		const c = b.split('.')
		if (c.length <= 1) return
		setValue(
			`${a.slice(0, a.length - 1).join('/')}/${c.slice(0, c.length - 1).join('.')}_${userId}.${c[c.length - 1]}`
		)
	}, [value, userId])
	return (
		<div>
			<p>Github URI in the form gh://user/repo/branch/folder/file.json</p>
			<Input type="text" fullWidth={true} value={value} onChange={handleChange} /><br />
			<Button onClick={() => onSubmit(value)} disabled={!valid}>Submit</Button>
			<Button onClick={onCancel}>Cancel</Button>
			<Button disabled={!userId} onClick={handleAppendUserId}>Append user ID</Button>
		</div>
	)
}

export default EditGithubUriControl
