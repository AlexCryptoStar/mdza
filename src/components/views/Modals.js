import React from 'react';
import { createObserver, collect } from 'dop'
import Modal from 'react-responsive-modal';
import { minpassword } from '/const/'
import styled from 'styled-components';
import ButtonBig from '/components/styled/Button';
import styles from '/const/styles'
import {
    FormField,
    FormFieldButtonLeft,
    FormFieldButtonRight
} from '/components/styled/Form'
import { Wizard, WizardItem } from '/components/styled/Wizard'
import SwitchView from '/components/styled/SwitchView'
import Password from '/components/styled/Password'
import Input from '/components/styled/Input'
import InputInfo from '/components/styled/InputInfo'
import state from '/store/state'
import { setHref, setSeed } from '/store/actions'
import { routes, Show } from '/store/router'
import Div from '/components/styled/Div'
import { Coins } from '/api/coins'
import {
	getAssetId,
	getParamsFromLocation,
	getTotalAssets,
	getAssetsAsArray,
	isAssetWithPrivateKeyOrSeed,
	getSeed,
	getAsset,
	getReusableSeeds,
	getSymbolByAssetId
} from '/store/getters'
import { CoinAssets, CoinSeeds} from '/components/partials/RootToken'
import { RootToken, seedValue } from '/components/partials/RootToken'
import PropTypes from 'prop-types'
import { error } from 'util'

export default class Modals extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalIsOpen: true,
		};
	}
	
	componentWillMount() {
		state.view = {
			step: 0,
			password: '',
			repassword: '',
			email: '',
			loading: false
		}			
		this.observer = createObserver(m => this.forceUpdate())
		this.observer.observe(state.view)
		this.closeModal = this.closeModal.bind(this)
		this.onCreateWallet = this.onCreateWallet.bind(this)
		this.onNext = this.onNext.bind(this)
		this.onBack = this.onBack.bind(this)
		this.onChangePassword = this.onChangePassword.bind(this)	
		const { symbol } = getParamsFromLocation()
		this.Coin = Coins[symbol]
	}	
	componentWillUnmount() {
		this.observer.destroy()
		this.passlength = null
		this.repasslength = null
	}

	onNext() {		
		state.view.step = 1
	}
	onBack() {
		state.view.step -= 1
	}
	onChangePassword(e) {
		state.view.password = e.target.value
	}
	onChangeRepassword(e) {
        state.view.repassword = e.target.value
	}
	 
	closeModal() {
		setHref(routes.home())
		this.setState({ modalIsOpen: false });  
	}

	onCreateWallet() {
		try {
			state.view.loading = true
			setTimeout(() => {
				this.seedValue = sessionStorage.getItem('seeds')
				this.seedArray = this.seedValue.split(',')
				const assets = getAssetsAsArray()
				const password = state.view.password
				assets.forEach((assetValue, key, assets) => {
					const assetId = getAssetId(assetValue)
					const seed = this.seedArray[key]	
					const isPrivateKeyOrSeed = isAssetWithPrivateKeyOrSeed(assetId)			
					if (isPrivateKeyOrSeed)
						setHref(routes.asset({ asset_id: assetId }))
					else {
						setSeed(assetId, seed, password)			
					}
				});
				state.view.loading = false
				this.setState({modalIsOpen: false})
				setHref(routes.home())
			}, 5000)
		}
		catch (e) {
			console.log('Error generated Modal:' + e)
		}
	}

	get hasPassword() {
		if (state.view.password) 
			this.passlength = state.view.password.length
		else
			this.passlength = minpassword
        return (
            this.passlength >= minpassword &&
            state.view.password === state.view.repassword
        )
    }
	get hasRepassword() {
		if (state.view.password && state.view.repassword) {
			this.passlength = state.view.password.length
			this.repasslength = state.view.repassword.length
		}
		else{
			this.passlength = 0
			this.repasslength = 0
		}
		return (
			this.passlength > 0 &&
			this.repasslength > 0 &&
            this.passlength === this.repasslength &&
            state.view.password !== state.view.repassword
        )
    }
	
	render() {
		return React.createElement(CreateModal, {
			Coin: this.Coin,
			closeModal: this.closeModal,
			modalIsOpen: this.state.modalIsOpen,
			step: state.view.step,
			password: state.view.password,
			repassword: state.view.repassword,
			hasPassword: this.hasPassword,
			hasRepassword: this.hasRepassword,
			onChangePassword: this.onChangePassword,
			onChangeRepassword: this.onChangeRepassword, 
			onNext: this.onNext,
			onBack: this.onBack,
			assetId: this.state.assetId,
			email: state.view.email,
			onCreateWallet: this.onCreateWallet,
			loading: state.view.loading,
		})
	}
}

function CreateModal({
	Coin,
	closeModal,
	modalIsOpen,
	step,
	password,
	repassword,
	hasPassword,
	hasRepassword,
	onChangePassword,
	onChangeRepassword, 
	onNext, 
	onBack,
	assetId,
	email,
	onCreateWallet,
	loading
}) {
	return (
		<div>
			<Modal
				open={modalIsOpen}
				style={customStyles}
				onClose={closeModal}
			>		
				<WizardContainer>
					<Wizard>
						{[0, 1].map(item => {
							return item < step ? (
								<WizardItem status="2">✓</WizardItem>
							) : (
								<WizardItem status={item > step ? 1 : 2}>
									{item + 1}
								</WizardItem>
							)
						})}
					</Wizard>
				</WizardContainer>
				<WizardContainerMobile>
					Step <span>{step + 1}</span> of 2
				</WizardContainerMobile>

				<Container>						
					<SwitchView active={step}>
						
						<ContainerView>
							<Title>Welcome valuable customer!</Title>
							<Description>
								We have open for You 10 most popular crypto wallets and You can start to use those wallet for accept and send crypto right after
									<strong>
										<span>ACTIVATION.</span>
									</strong>{' '}<br></br>
								For activation, please enter password in to following field:
							</Description>
							
							<Content>
								<FormField>
									<InputInfo
										placeholder="Username"
										width="100%"
									>
									</InputInfo>
								</FormField>
								<FormField>
									<Password
										placeholder="Password"
										minlength={minpassword}
										value={password}
										onChange={onChangePassword}
										width="100%"
										type="password"
									/>
								</FormField>
								<FormField>
									<Input
										placeholder="Repeat Password"
										minlength={minpassword}
										error={
											hasRepassword
												? 'Passwords do not match'
												: null
										}
										invalid={hasRepassword}
										value={repassword}
										onChange={onChangeRepassword}
										width="100%"
										type="password"
									/>
								</FormField>

								<FormField>
									<InputInfo
										placeholder="Email"
										width="100%"
										value={email}
									>
									</InputInfo>
								</FormField>

								<FormField>
									<FormFieldButtonRight width="100%">
										<ButtonBig
											width="100%"
											disabled={!hasPassword}
											onClick={onNext}
										>
											Next
										</ButtonBig>
									</FormFieldButtonRight>
								</FormField>
							</Content>

						</ContainerView>

							<ContainerView>
							<Title>Write or print your password and store it</Title>
							<Description>
								Write or print your password and store it {' '}
								<strong>
									<span>securely</span>
								</strong>{' '} offline.<br></br>
								Without it, you will{' '}
								<strong>
									<span>not be able</span>
								</strong>{' '} to access your cryptocurrency {' '}
								<strong>
									<span>we don't keep any user data and can't recover it for You</span>
								</strong>.{' '}
								This is make our system one of the {' '}
								<strong>
									<span>best</span>
								</strong>{' '} and {' '}
								<strong>
									<span>secure</span>
								</strong>{' '} online wallets!
								
								Make two copies of your recovery phrase and store them is separate physical locations.
								Please note, your recovery phrase is case sensitive and each word must be written in the correct order.{' '}
								<strong>
									<span>Important!</span>
								</strong>{' '}
								right after activation, backup your wallets by using our backup utility and store it {' '}
								<strong>
									<span>securely</span>
								</strong>{' '}
								offline.
								You need it to continue working with Yours wallets. Without it, you will {' '}
								<strong>
									<span>not be able </span>
								</strong>{' '}to access your cryptocurrency{' '}
								<strong>
									<span>we don't keep any user data and can't recover it for You</span>
								</strong>{' '}.{' '}
								<strong>
									<span>Do not share it with anyone.</span>
								</strong>{' '}
							</Description>
							<span><br></br></span>
							<FormField>
								<FormFieldButtonLeft width="25%">
									<ButtonBig width="100%" onClick={onBack} name="close">
										Back
									</ButtonBig>
								</FormFieldButtonLeft>
								<FormFieldButtonRight width="75%">
									<ButtonBig
										width="100%"
										onClick={onCreateWallet}										
										loading={loading}
										loadingIco="/static/image/loading.gif"
									>
									"I save my password in secure place, activate my wallets now"
									</ButtonBig>		
									<Show if={loading} >
										<Div font-size="10px" color={styles.color.red}>
											This might take several minutes<br />and can
											freeze your browser
										</Div>
									</Show>
								</FormFieldButtonRight>
							</FormField>
							
						</ContainerView>

					</SwitchView>
				</Container>
			</Modal>
		</div>
	)
}

Modals.propTypes = {
	seeds: PropTypes.array
}

const customStyles = {
	content: {
		top: '50%',
		left: '60%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		backgroundColor: 'rgba(255, 255, 255, 1)'
	},
	overlay: {
		zIndex: 1000
	}
};

const WizardContainer = styled.div`
    ${styles.media.fourth} {
        display: none;
    }
`
const WizardContainerMobile = styled.div`
    font-weight: 100;
    color: #007095;
    font-size: 12px;
    display: none;
    & > span {
        font-weight: normal;
    }
    ${styles.media.fourth} {
        display: block;
    }
`

const Container = styled.div`
    max-width: 550px;
    margin: 0 auto;
`

const ContainerView = styled.div``

const Title = styled.div`
    text-align: center;
    padding-top: 20px;
    color: ${styles.color.background2};
    font-weight: 900;
    font-size: 22px;
    ${styles.media.fourth} {
        padding-top: 0;
        font-size: 20px;
        text-align: left;
        line-height: 16px;
    }
`

const Description = styled.div`
    padding-top: 20px;
    color: ${styles.color.front3};
    font-size: 14px;
    & strong {
        font-weight: bold;
    }
    & span {
        color: ${styles.color.red3};
    }
    ${styles.media.fourth} {
        font-size: 12px;
    }
`

const Content = styled.div`
    padding-top: 20px;
`
