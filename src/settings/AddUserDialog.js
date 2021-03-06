// @flow
import m from "mithril"
import {lang} from "../misc/LanguageViewModel"
import {assertMainOrNode} from "../api/Env"
import {TextField} from "../gui/base/TextField"
import {TUTANOTA_MAIL_ADDRESS_DOMAINS, AccountType, BookingItemFeatureType} from "../api/common/TutanotaConstants"
import {Dialog} from "../gui/base/Dialog"
import {logins} from "../api/main/LoginController"
import {PasswordForm} from "./PasswordForm"
import {SelectMailAddressForm} from "./SelectMailAddressForm"
import {load} from "../api/main/Entity"
import {CustomerTypeRef} from "../api/entities/sys/Customer"
import {CustomerInfoTypeRef} from "../api/entities/sys/CustomerInfo"
import {addAll} from "../api/common/utils/ArrayUtils"
import {neverNull} from "../api/common/utils/Utils"
import * as BuyDialog from "./BuyDialog"
import {worker} from "../api/main/WorkerClient"

assertMainOrNode()

export function show(): Promise<void> {
	return getAvailableDomains().then(availableDomains => {
		let nameField = new TextField("name_label", () => lang.get("loginNameInfoAdmin_msg"))
		let passwordForm = new PasswordForm(false, false, false, null)
		let mailAddressForm = new SelectMailAddressForm(availableDomains)
		let form = {
			view: () => {
				return [
					m(nameField),
					m(mailAddressForm),
					m(passwordForm)
				]
			}
		}
		return Dialog.smallDialog(lang.get("addUsers_action"), form, () => mailAddressForm.getErrorMessageId() || passwordForm.getErrorMessageId()).then(okClicked => {
			if (okClicked) {
				return BuyDialog.show(BookingItemFeatureType.Users, 1, 0).then(accepted => {
					if (accepted) {
						let p = worker.createUser(nameField.value(), mailAddressForm.getCleanMailAddress(), passwordForm.getNewPassword(), 0, 1)
						return Dialog.progress(() => lang.get("createActionStatus_msg", {
							"{index}": 0,
							"{count}": 1
						}), p, true)
					}
				})
			}
		})
	})
}

export function getAvailableDomains(): Promise<string[]> {
	return load(CustomerTypeRef, neverNull(logins.getUserController().user.customer)).then(customer => {
		return load(CustomerInfoTypeRef, customer.customerInfo).then(customerInfo => {
			let availableDomains = customerInfo.domainInfos.map(info => info.domain)
			if (logins.getUserController().user.accountType != AccountType.STARTER) {
				addAll(availableDomains, TUTANOTA_MAIL_ADDRESS_DOMAINS)
			}
			return availableDomains
		})
	})
}