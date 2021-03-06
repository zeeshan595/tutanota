import {Request} from "../../src/api/common/WorkerProtocol"
// see https://bitwiseshiftleft.github.io/sjcl/doc/symbols/sjcl.bitArray.html

// type that is used by sjcl for any encryption/decryption operation
type BitArray = number[]

type Aes128Key = BitArray
type Aes256Key = BitArray
type SignedBytes = number[]

type Base64 = string
type Base64Ext = string
type Base64Url = string
type Hex = string
type NumberString = string

type Id = string
type IdTuple = [string,string]
type Params = {[key:string]:string}
type SVG = string

type RsaKeyPair = {
	publicKey: PublicKey,
	privateKey: PrivateKey,
}

type PrivateKey = {
	version: number,

	keyLength: number,
	modulus: Base64,
	privateExponent: Base64,
	primeP: Base64,
	primeQ: Base64,
	primeExponentP: Base64,
	primeExponentQ: Base64,
	crtCoefficient: Base64,
}

type PublicKey = {
	version: number,
	keyLength: number,
	modulus: Base64,
	publicExponent: number,
}

type WorkerRequestType = 'setup'
	| 'signup'
	| 'createSession'
	| 'createExternalSession'
	| 'logout'
	| 'resumeSession'
	| 'testEcho'
	| 'testError'
	| 'deleteSession'
	| 'restRequest'
	| 'entityRequest'
	| 'serviceRequest'
	| 'createMailFolder'
	| 'readAvailableCustomerStorage'
	| 'readUsedCustomerStorage'
	| 'createMailDraft'
	| 'updateMailDraft'
	| 'sendMailDraft'
	| 'downloadFileContent'
	| 'entropy'
	| 'tryReconnectEventBus'
	| 'changePassword'
	| 'setMailAliasStatus'
	| 'addMailAlias'
	| 'isMailAddressAvailable'
	| 'getAliasCounters'
	| 'changeUserPassword'
	| 'changeAdminFlag'
	| 'readUsedUserStorage'
	| 'deleteUser'
	| 'getPrice'
	| 'loadCustomerServerProperties'
	| 'addSpamRule'
	| 'createUser'
	| 'readUsedGroupStorage'
	| 'createMailGroup'
	| 'createTeamGroup'
	| 'addUserToGroup'
	| 'removeUserFromGroup'
	| 'deactivateGroup'
	| 'loadContactFormByPath'
	| 'addDomain'
	| 'removeDomain'
	| 'setCatchAllGroup'
	| 'uploadCertificate'
	| 'deleteCertificate'
	| 'createContactFormUser'
type MainRequestType ='execNative'
	| 'entityEvent'
	| 'error'
	|'progress'
type NativeRequestType =  'init'
	| 'generateRsaKey'
	| 'rsaEncrypt'
	| 'rsaDecrypt'
	| 'aesEncryptFile'
	| 'aesDecryptFile'
	| 'open'
	| 'openFileChooser'
	| 'deleteFile'
	| 'getName'
	| 'getMimeType'
	| 'getSize'
	| 'upload'
	| 'download'
	| 'clearFileData'
	| 'findSuggestions'
	| 'initPushNotifications'
	| 'updatePushIdentifier'
type JsRequestType = ''


type Callback = (err: ?Error, data: ?Object) => Object
type Command = (msg: Request) => Promise<any>


type TypeEnum = "ELEMENT_TYPE" | "LIST_ELEMENT_TYPE" | "DATA_TRANSFER_TYPE" | "AGGREGATED_TYPE"

type AssociationTypeEnum = "ELEMENT_ASSOCIATION" | "LIST_ASSOCIATION" | "LIST_ELEMENT_ASSOCIATION" | "AGGREGATION"

type CardinalityEnum = "ZeroOrOne" | "Any" | "One"

type ValueTypeEnum = "String" | "Number" | "Bytes" | "Date" | "Boolean" | "GeneratedId" | "CustomId"

type ConversationTypeEnum = '0' | '1' | '2'

type TypeModel = {
	id: number,
	app:string,
	version: string,
	name:string,
	type:TypeEnum,
	versioned:boolean,
	encrypted:boolean,
	rootId: string,
	values:{[key:string]:ModelValue},
	associations:{[key:string]:ModelAssociation}
}

type ModelValue = {
	id: number,
	name: string,
	type: ValueTypeEnum,
	cardinality: CardinalityEnum,
	final: boolean,
	encrypted: boolean
}

type ModelAssociation = {
	type: AssociationTypeEnum,
	cardinality: CardinalityEnum,
	refType: string
}

type EnvType = {
	stagingLevel: StagingLevelEnum,
	staticUrl : ?string, // if null the url from the browser is used
	mode : "Browser" | "App" | "Test" | "Playground",
	platformId: ?"ios" | ?"android",
	dist: boolean,
	versionNumber : string,
	timeout: number,
	rootPathPrefix: string,
}

declare var env: EnvType

type Credentials = {
	mailAddress:string,
	encryptedPassword:Base64,
	accessToken: Base64Url,
}

declare function browser(f: Function): Function
declare function node(f: Function): Function

type RecipientInfoTypeEnum = 'unknown' | 'internal' | 'external'

type RecipientInfoName = 'RecipientInfo'
type RecipientInfo = {
	_type: RecipientInfoName,
	type: RecipientInfoTypeEnum,
	mailAddress:string,
	name: string,
	contact: ?Contact
}

type DataFile = {
	_type: 'DataFile',
	name: string,
	mimeType: string,
	data: Uint8Array,
	size: number,
	id: ?IdTuple
}

type FileReference = {
	_type: 'FileReference',
	name:string,
	mimeType:string,
	location:string,
	size:number
}

type KeyListener = {
	modifier: number,
	callback: Function
}