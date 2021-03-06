//@flow
import m from "mithril"
import {SessionTypeRef} from "../api/entities/sys/Session"
import {load} from "../api/main/Entity"
import {Dialog} from "../gui/base/Dialog"
import {SysService} from "../api/entities/sys/Services"
import {HttpMethod, isSameTypeRef, isSameId} from "../api/common/EntityFunctions"
import {createSecondFactorAuthData} from "../api/entities/sys/SecondFactorAuthData"
import {OperationType, SessionState, SecondFactorType} from "../api/common/TutanotaConstants"
import {worker} from "../api/main/WorkerClient"
import {lang} from "../misc/LanguageViewModel"
import {neverNull} from "../api/common/utils/Utils"
import {SecondFactorImage} from "../gui/base/icons/Icons"
import {U2fClient, U2fWrongDeviceError, U2fError} from "../misc/U2fClient"

/**
 * Handles showing and hiding of the following dialogs:
 * 1. Waiting for second factor approval (either token or by other client) during login
 * 2. Ask for approving the login on another client (setupAcceptOtherClientLoginListener() must have been called initially). If the dialog is visible and another client tries to login at the same time, that second login is ignored.
 */
export class SecondFactorHandler {
	_otherLoginSessionId: ?IdTuple;
	_otherLoginDialog: ?Dialog;
	_otherLoginListenerInitialized: boolean;

	_waitingForSecondFactorDialog: ?Dialog;

	constructor() {
		this._otherLoginSessionId = null
		this._otherLoginDialog = null
		this._otherLoginListenerInitialized = false
		this._waitingForSecondFactorDialog = null
	}

	setupAcceptOtherClientLoginListener() {
		if (!this._otherLoginListenerInitialized) {
			this._otherLoginListenerInitialized = true
			worker.getEntityEventController().addListener((typeRef: TypeRef<any>, listId: ?string, elementId: string, operation: OperationTypeEnum) => {
				let sessionId = [neverNull(listId), elementId];
				if (isSameTypeRef(typeRef, SessionTypeRef)) {
					if (operation == OperationType.CREATE && this._otherLoginSessionId == null) {
						return load(SessionTypeRef, sessionId).then(session => {
							if (session.state == SessionState.SESSION_STATE_PENDING && this._otherLoginSessionId == null) {
								this._otherLoginSessionId = session._id
								let text = lang.get("secondFactorConfirmLogin_msg", {
									"{clientIdentifier}": session.clientIdentifier,
									"{ipAddress}": session.loginIpAddress
								})
								this._otherLoginDialog = Dialog.smallActionDialog(lang.get("secondFactorConfirmLogin_label"), {
									view: () => m(".text-break.pt", text)
								}, () => {
									let serviceData = createSecondFactorAuthData()
									serviceData.session = session._id
									serviceData.type = null
									worker.serviceRequest(SysService.SecondFactorAuthService, HttpMethod.POST, serviceData)
									if (this._otherLoginDialog) {
										this._otherLoginDialog.close()
										this._otherLoginSessionId = null
										this._otherLoginDialog = null
									}
								})
							}
						})
					} else if (operation == OperationType.UPDATE && this._otherLoginSessionId && isSameId(this._otherLoginSessionId, sessionId)) {
						return load(SessionTypeRef, sessionId).then(session => {
							if (session.state != SessionState.SESSION_STATE_PENDING && this._otherLoginDialog && isSameId(neverNull(this._otherLoginSessionId), sessionId)) {
								this._otherLoginDialog.close()
								this._otherLoginSessionId = null
								this._otherLoginDialog = null
							}
						})
					}
				}
			})
		}
	}

	closeWaitingForSecondFactorDialog() {
		if (this._waitingForSecondFactorDialog) {
			this._waitingForSecondFactorDialog.close()
			this._waitingForSecondFactorDialog = null
		}
	}

	showWaitingForSecondFactorDialog(sessionId: IdTuple, challenges: Challenge[]) {
		if (!this._waitingForSecondFactorDialog) {
			this._waitingForSecondFactorDialog = Dialog.pending("secondFactorPending_msg", SecondFactorImage)
			challenges.forEach(challenge => {
				if (challenge.type == SecondFactorType.u2f) {
					let u2fClient = new U2fClient()


					let registerResumeOnError = () => {
						u2fClient.sign(sessionId, neverNull(challenge.u2f))
							.catch(e => {
								if (e instanceof U2fWrongDeviceError) {
									Dialog.error("u2fAuthUnregisteredDevice_msg")
								} else if (e instanceof U2fError) {
									Dialog.error("u2fUnexpectedError_msg")
								}
								if (this._waitingForSecondFactorDialog && this._waitingForSecondFactorDialog.visible) registerResumeOnError()
							})
					}

					registerResumeOnError()
				}
			})
		}
	}
}

export const secondFactorHandler: SecondFactorHandler = new SecondFactorHandler()