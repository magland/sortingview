import { FunctionComponent } from "react";

type Props ={
	uri?: string
}

const FormatUri: FunctionComponent<Props> = ({uri}) => {
	if (!uri) return <span>undefined</span>
	else if (uri.startsWith('gh://')) {
		const {user, repo, branch, file} = parseGithubUri(uri)
		const url = `https://github.com/${user}/${repo}/blob/${branch}/${file}`
		return (
			<a href={url} target="_blank" rel="noreferrer">{uri}</a>
		)
	}
	else return (
		<span>{uri}</span>
	)
}

const parseGithubUri = (uri: string) => {
	const a = uri.split('/')
	return {
		user: a[2],
		repo: a[3],
		branch: a[4],
		file: a.slice(5).join('/')
	}
}

export default FormatUri
