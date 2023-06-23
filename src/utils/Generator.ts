import { customAlphabet } from 'nanoid'

function nanoIdGenerator(regex: string, size: number) {
	const nanoid = customAlphabet(regex, size)
	return nanoid()
}

export { nanoIdGenerator }
