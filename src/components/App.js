import React, { Component } from 'react'
import styled from 'styled-components'
import styles from '/const/styles'
import Popups from '/components/partials/Popups'
import Notifications from '/components/partials/Notifications'
import Header from '/components/partials/Header'
import SideMenu from '/components/partials/SideMenu'
import Views from '/components/partials/Views'
import Footer from '/components/partials/Footer'
import { createObserver } from 'dop'
import state from '/store/state'
import RootToken from '/components/partials/RootToken'
import Modals from '/components/views/Modals'
import {
	getAssetId,
	getAssetsAsArray,
	isAssetWithPrivateKeyOrSeed
} from '/store/getters'


export default class App extends React.Component {  
    constructor(props) {
        super(props)
        this.state = {
            seedWords: null
        }
    }

    componentWillMount() {        
        this.observer = createObserver(mutations => this.forceUpdate())
        this.observer.observe(state, 'totalAssets')
        const totalAssets = state.totalAssets
        RootToken(totalAssets, false)
        const assets = getAssetsAsArray();
        const assetId = getAssetId(assets[0])
        this.isPrivateKeyOrSeed = isAssetWithPrivateKeyOrSeed(assetId)
        // sessionStorage.setItem('seeds', res)
        // this.seedValue = sessionStorage.getItem('seeds')
    }

    componentWillUnmount() {
        this.observer.destroy()
    }
    render() {
        if (!this.isPrivateKeyOrSeed) {
            return (
                <Background>
                    <Modals />
                    <Notifications />
                    <SideMenu />
                    <Header />
                    <Views />
                    <Footer />
                    <Popups />
                </Background>
            )
        }
        else {
            return (
                <Background>
                    <Notifications />
                    <SideMenu />
                    <Header />
                    <Views />
                    <Footer />
                    <Popups />
                </Background>
            )
        }
    }
}

const Background = styled.div`
    height: 100%;
    background: linear-gradient(to bottom, #007196 150px, #d7dbd5 150px);
`

// function show() {
//     let scanner = new Instascan.Scanner({
//         video: document.getElementById('cam')
//     })
//     scanner.addListener('scan', function(content) {
//         console.log(content)
//     })
//     Instascan.Camera.getCameras()
//         .then(function(cameras) {
//             if (cameras.length > 0) {
//                 scanner.start(cameras[0])
//             } else {
//                 console.error('No cameras found.')
//             }
//         })
//         .catch(function(e) {
//             console.error(e)
//         })
// }