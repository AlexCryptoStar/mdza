import React, { Component } from 'react'
import styled from 'styled-components'
import { createObserver } from 'dop'
import CountUp from 'react-countup'

import styles from '/const/styles'
import { currencies } from '/const/currencies'
import routes from '/const/routes'


import { round } from '/api/numbers'
import { Assets } from '/api/Assets'
import sortBy from '/api/sortBy'

import state from '/store/state'
import { convertBalance } from '/store/getters'
import { setHref } from '/store/actions'

import { RightContainerPadding } from '/components/styled/Right'

import Circle from '/components/styled/Circle'

// development mode
// window.state = state

export default class Dashboard extends Component {
    componentWillMount() {
        this.observer = createObserver(mutations => this.forceUpdate())
        this.observer.observe(state, 'balance')

        this.state = { balance_start: state.balance }
    }
    componentWillUnmount() {
        // this.observer.destroy()
    }
    shouldComponentUpdate() {
        return false
    }

    onClick(asset_id) {
        setHref(routes.asset(asset_id))
    }

    render() {
        const byCategory = true // false means by total balance
        const dataUnformated = {}
        for (let id in state.assets) {
            let asset = state.assets[id]
            if (dataUnformated[asset.symbol] === undefined)
                dataUnformated[asset.symbol] = {
                    label: Assets[asset.symbol].name,
                    color: Assets[asset.symbol].color,
                    balance_asset_number: 0,
                    balance_currency_number: 0,
                    assets: []
                }

            let assetUnformated = dataUnformated[asset.symbol]
            assetUnformated.balance_asset_number += asset.balance
            assetUnformated.balance_currency_number += convertBalance(
                asset.symbol,
                asset.balance
            )

            assetUnformated.assets.push({
                label: asset.label || asset.address,
                address: asset.address,
                balance_asset: asset.balance + ' ' + asset.symbol,
                balance_currency_number: convertBalance(
                    asset.symbol,
                    asset.balance
                ),
                percentage: 0,
                id: id,
                icon: `/static/image/${asset.symbol}.svg`
            })
        }

        // Ordering
        let data = Object.keys(dataUnformated).map(symbol => {
            let category = dataUnformated[symbol]

            category.balance_asset =
                category.balance_asset_number + ' ' + symbol

            category.balance_currency = currencies[state.currency].format(
                category.balance_currency_number,
                0
            )

            category.percentage = round(
                category.balance_currency_number * 100 / state.balance || 0
            )

            category.assets = category.assets.map(asset => {
                asset.balance_currency = currencies[state.currency].format(
                    asset.balance_currency_number,
                    0
                )
                asset.percentage = round(
                    asset.balance_currency_number *
                        100 /
                        (byCategory
                            ? category.balance_currency_number
                            : state.balance) || 0
                )
                return asset
            })

            category.assets = sortBy(
                category.assets,
                '-balance_currency_number'
            )

            return category
        })

        data = sortBy(data, '-balance_currency_number')

        const balance_start = this.state.balance_start
        this.state.balance_start = state.balance

        return React.createElement(DashboardTemplate, {
            data: data,
            onClick: this.onClick,
            ascii: currencies[state.currency].ascii,
            balance_start: balance_start,
            balance_end: state.balance,
            cryptoPrices: state.prices,
            currency: state.currency
        })
    }
}

function DashboardTemplate({
    data,
    onClick,
    ascii,
    balance_start,
    balance_end,
    cryptoPrices,
    currency
}) {
    return (
        <RightContainerPadding>
            <Left>
                <Chart>
                    <ChartBalance>
                        <ChartLabel>Total balance</ChartLabel>
                        <ChartNumber>
                            <AmountSuper>{ascii}</AmountSuper>
                            <Amount>
                                <CountUp
                                    start={balance_start}
                                    end={balance_end}
                                    duration={5}
                                    useEasing={true}
                                    useGrouping={true}
                                    separator=","
                                />
                            </Amount>
                            {/* <AmountSuper>.52</AmountSuper>  */}
                        </ChartNumber>
                    </ChartBalance>
                    <ChartChart>
                        <Circle
                            size={200}
                            strokeWidth="1.5"
                            segments={/* [{percentage:70,color:'red'},{percentage:30,color:'blue'}] */
                            data.map(category => ({
                                percentage: category.percentage,
                                color: category.color
                            }))}
                        />
                    </ChartChart>
                </Chart>
                <Currencies>
                    {Object.keys(cryptoPrices).map(symbol => (
                        <Currency>
                            <CurrencyIco><img src={`/static/image/${symbol}.svg`} width="25" /></CurrencyIco>
                            <CurrencyText>
                                <CurrencyLabel>{Assets[symbol].name}</CurrencyLabel>
                                <CurrencyValue>{symbol} ≈ <span>{currencies[currency].format(cryptoPrices[symbol], Assets[symbol].price_decimals)}</span></CurrencyValue>
                            </CurrencyText>
                        </Currency>
                    ))}
                    {/* <Currency>
                        <CurrencyIco><img src={`/static/image/BTC.svg`} width="25" /></CurrencyIco>
                        <CurrencyText>
                            <CurrencyLabel>Bitcoin</CurrencyLabel>
                            <CurrencyValue>BTC ≈ <span>$5,235</span></CurrencyValue>
                        </CurrencyText>
                    </Currency> */}
                    {/* <Currency>
                        <CurrencyIco><img src={`/static/image/ETH.svg`} width="25" /></CurrencyIco>
                        <CurrencyText>
                            <CurrencyLabel>Ethereum</CurrencyLabel>
                            <CurrencyValue>ETH ≈ <span>$342</span></CurrencyValue>
                        </CurrencyText>
                    </Currency> */}
                </Currencies>
            </Left>
            <Right>
                <div>
                {data.map(category => {
                    return (
                        <Category>
                            <HeaderAsset>
                                <HeaderLeft>
                                    <HeaderLeftPercentage>
                                        <Circle
                                            size={43}
                                            strokeWidth="2.5"
                                            segments={[
                                                {
                                                    percentage:
                                                        category.percentage,
                                                    color: category.color
                                                }
                                            ]}
                                        >
                                            <CircleText>
                                                <text
                                                    x="50%"
                                                    y="50%"
                                                    class="chart-number"
                                                >
                                                    {category.percentage}%
                                                </text>
                                            </CircleText>
                                        </Circle>
                                    </HeaderLeftPercentage>
                                    <HeaderLeftText>
                                        <HeaderLeftTitle>
                                            {category.label}
                                        </HeaderLeftTitle>
                                        <HeaderLeftSubtitle>
                                            {category.assets.length} assets
                                        </HeaderLeftSubtitle>
                                    </HeaderLeftText>
                                </HeaderLeft>
                                <HeaderRight>
                                    <HeaderRightTitle>
                                        {category.balance_currency}
                                    </HeaderRightTitle>
                                    <HeaderRightSubtitle>
                                        {category.balance_asset}
                                    </HeaderRightSubtitle>
                                </HeaderRight>
                            </HeaderAsset>
                            <AssetsList>
                                {category.assets.map(asset => (
                                    <Asset
                                        onClick={() => onClick(asset.id)}
                                    >
                                        <AssetIcon>
                                            <img
                                                src={asset.icon}
                                                width="20"
                                                height="20"
                                            />
                                        </AssetIcon>
                                        <AssetText>
                                            <AssetLeft>
                                                <AssetTitle1>
                                                    {asset.label}
                                                </AssetTitle1>
                                                <AssetSubtitle>
                                                    {asset.address}
                                                </AssetSubtitle>
                                            </AssetLeft>
                                            <AssetRight>
                                                <AssetTitle2>
                                                    {asset.balance_currency}
                                                </AssetTitle2>
                                                <AssetSubtitle>
                                                    {asset.balance_asset}
                                                </AssetSubtitle>
                                            </AssetRight>
                                            <AssetPercentage>
                                                <AssetPercentageLeft
                                                    width={
                                                        asset.percentage +
                                                        '%'
                                                    }
                                                    color="#feb034"
                                                />
                                                <AssetPercentageRight color="#feb034">
                                                    {asset.percentage + '%'}
                                                </AssetPercentageRight>
                                            </AssetPercentage>
                                        </AssetText>
                                    </Asset>
                                ))}
                            </AssetsList>
                        </Category>
                    )
                })}

                {/* <Category>
                    <HeaderAsset>
                        <HeaderLeft>
                            <HeaderLeftPercentage>
                                <Circle size={50} strokeWidth="2.5" segments={[{percentage:10, color:'#7683c9'}]}>
                                    <CircleText>
                                        <text x="50%" y="50%" class="chart-number">10%</text>
                                    </CircleText>
                                </Circle>
                            </HeaderLeftPercentage>
                            <HeaderLeftText>
                                <HeaderLeftTitle>Ethereum</HeaderLeftTitle>
                                <HeaderLeftSubtitle>1 assets</HeaderLeftSubtitle>
                            </HeaderLeftText>
                        </HeaderLeft>
                        <HeaderRight>
                            <HeaderRightTitle>$30,131</HeaderRightTitle>
                            <HeaderRightSubtitle>10.313 ETH</HeaderRightSubtitle>
                        </HeaderRight>
                    </HeaderAsset>
                    <Assets>
                        <Asset>
                            <AssetIcon><img src="/static/image/ETH.svg" width="20" height="20" /></AssetIcon>
                            <AssetText>
                                <AssetLeft>
                                    <AssetTitle>My wallet 1</AssetTitle>
                                    <AssetSubtitle>1FA4aEo21ZxTXs1YEFhKD5gpPzNSQ45hQg</AssetSubtitle>
                                </AssetLeft>
                                <AssetRight>
                                    <AssetTitle>$20,312</AssetTitle>
                                    <AssetSubtitle>5.013 BTC</AssetSubtitle>
                                </AssetRight>
                                <AssetPercentage>
                                    <AssetPercentageLeft width="10%" color="#7683c9" />
                                    <AssetPercentageRight color="#7683c9">10%</AssetPercentageRight>
                                </AssetPercentage>
                            </AssetText>
                        </Asset>
                    </Assets>
                </Category> */}
                </div>
            </Right>
        </RightContainerPadding>
    )
}



const Left = styled.div`
    float: left;
    width: 200px;
    position: relative;
    ${styles.media.fourth} {
        width: 100%;
        float: none;
    }        
`
const Right = styled.div`
    float: left;
    width: calc(100% - 230px);
    padding-left: 30px;
    padding-top: 5px;
    ${styles.media.fourth} {
        width: 100%;
        float: none;
        padding-left: 0;
        margin-top: 100px;
        clear: both;
        & > div {
        }
    }  
`

const Chart = styled.div`
width: 200px;
${styles.media.fourth} {
    margin: 0 auto;
}    
`
const ChartChart = styled.div`
`

const ChartBalance = styled.div`
    position: absolute;
    text-align: center;
    width: 200px;
    padding-top: 75px;
`

const ChartLabel = styled.div`
    font-size: 12px;
    color: ${styles.color.front2};
`

const ChartNumber = styled.div`
line-height: 35px;
`

const AmountSuper = styled.span`
    position: relative;
    top: -10px;
    font-size: 20px;
    font-weight: bold;
    color: ${styles.color.black};
`
const Amount = styled.span`
    font-size: 36px;
    font-weight: bold;
    color: ${styles.color.black};
`

const Category = styled.div`
    clear: both;
    margin-top: 75px;
    &:first-child {
        margin-top: 0;
    }
`

const HeaderAsset = styled.div`
min-height: 50px;
`

const HeaderLeft = styled.div``
const HeaderLeftPercentage = styled.div`
float: left;
${styles.media.third} {
    & > svg {
        width: 30px;
        height: 30px;
    }
}  
`
const HeaderLeftText = styled.div`
    float: left;
    padding-top: 3px;
    padding-left: 18px;
    ${styles.media.third} {
        padding-left: 10px;
        padding-top: 0;
    }        
`
const HeaderLeftTitle = styled.div`
    color: ${styles.color.black};
    font-weight: 900;
    font-size: 25px;
    line-height: 25px;
    ${styles.media.third} {
        font-size: 22px;
        line-height: 22px;
    }
`
const HeaderLeftSubtitle = styled.div`
    color: ${styles.color.grey1};
    font-size: 13px;
    font-weight: 100;
    letter-spacing: 0.5px;
    ${styles.media.third} {
        display: none;
    }
`

const HeaderRight = styled.div`
    float: right;
    padding-top: 3px;
    ${styles.media.third} {
        float:none;
        clear: both;
        top: -15px;
        position: relative;
    }        
`

const HeaderRightTitle = styled.div`
    color: ${styles.color.black};
    font-weight: 900;
    font-size: 20px;
    line-height: 25px;
    text-align: right;
    ${styles.media.third} {
        padding-left: 40px;
        text-align: left;
        font-size: 15px;
        line-height: 22px;
    }  
`

const HeaderRightSubtitle = styled.div`
    color: ${styles.color.grey1};
    font-size: 13px;
    font-weight: bold;
    text-align: right;
    ${styles.media.third} {
        padding-left: 40px;
        text-align: left;
    }        
`

const CircleText = styled.g`
    -moz-transform: translateY(0.45em);
    -ms-transform: translateY(0.45em);
    -webkit-transform: translateY(0.45em);
    transform: translateY(0.45em);

    .chart-number {
        fill: ${styles.color.front3};
        letter-spacing: -0.02em;
        font-size: 0.7em;
        font-weight: bold;
        line-height: 1;
        text-anchor: middle;
        -moz-transform: translateY(-0.25em);
        -ms-transform: translateY(-0.25em);
        -webkit-transform: translateY(-0.25em);
        transform: translateY(-0.25em);
    }
`

const AssetsList = styled.div`clear: both;`
const Asset = styled.div`
    clear: both;
    margin-top: 25px;
    margin-bottom: 35px;
    margin-left: 23px;
    height: 55px;
    cursor: pointer;
    border-radius: 1px;
    &:hover {
        background-color: ${styles.color.background1};
        box-shadow: 0 0 0px 15px ${styles.color.background1};
    }
    ${styles.media.third} {
        height: 120px;
        margin-left: 10px;
    }
`
const AssetIcon = styled.div`
    padding-top: 5px;
    padding-right: 5px;
    text-align: right;
    float: left;
`
const AssetText = styled.div`
margin-left: 38px;
${styles.media.third} {
    margin-left: 31px;
}
`

const AssetLeft = styled.div`
float: left;
${styles.media.third} {
    width: 100%;
}
`
const AssetRight = styled.div`
    float: right;
    text-align: right;
    ${styles.media.third} {
        clear: both;
        text-align: left;
        float: none;
    }
`

const AssetTitle1 = styled.div`
    color: ${styles.color.front3};
    font-weight: bold;
    font-size: 16px;
    text-overflow: ellipsis;
    overflow: hidden;
`
const AssetTitle2 = styled.div`
    color: ${styles.color.front3};
    font-weight: bold;
    font-size: 16px;
    ${styles.media.third} {
        color: #aaaaaa;
        line-height: 20px;
        letter-spacing: 0.5px;
        font-weight: bold;
        font-size: 12px;
        color: ${styles.color.grey1};
    }
`
const AssetSubtitle = styled.div`
    padding-top: 3px;
    color: ${styles.color.grey1};
    letter-spacing: 0.5px;
    font-weight: 100;
    font-size: 12px;
    clear: both;
    text-overflow: ellipsis;
    overflow: hidden;
    line-height: 20px;
    ${styles.media.third} {
        padding-top: 0;
    }        
`
const AssetPercentage = styled.div`
    padding-top: 3px;
    clear: both;
    ${styles.media.third} {
        padding-top: 0;
    }
`
const AssetPercentageLeft = styled.div`
    width: calc(${props => props.width} - 30px);
    background-color: ${props => props.color};
    height: 4px;
    border-radius: 100px;
    float: left;
    margin-top: 5px;
`
const AssetPercentageRight = styled.span`
    float: left;
    font-size: 10px;
    font-weight: bold;
    color: ${props => props.color};
    margin-left: 5px;
`

const Currencies = styled.div`
width: 200px;
margin: 0 auto;
`
const Currency = styled.div`
clear: both;
padding-top: 30px;
padding-left: 35px;
height: 42px;
${styles.media.third} {
    padding-top: 20px;
}  
`
const CurrencyIco = styled.div`
float: left;
padding-top: 5px;
padding-right: 10px;
`
const CurrencyText = styled.div`
float: left;
`
const CurrencyLabel = styled.div`
font-weight: 900;
color: ${styles.color.black};
font-size: 18px;
`
const CurrencyValue = styled.div`
color: ${styles.color.front3};
font-size: 13px;
font-weight: 200;
& span {
    font-weight: bold;
}
`