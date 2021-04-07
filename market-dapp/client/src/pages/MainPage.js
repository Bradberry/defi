import React, { Component } from 'react';
import { Button, Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Redirect } from "react-router-dom";
import ipfs from "../ipfs";
 

import "../css/mainpage.css";

const priceConversion = 10**18;

class MainPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            drizzle: props.drizzle,
            drizzleState: props.drizzleState,
            listCars: [],
            listSkins: [],
            latestNFTs: [],
            redirectBuyItem: false,
            selectedItemId: "",
            selectedTrack: "",
            selectedSimulator: "",
            selectedSeason: "",
            selectedSeries: "",
            selectedDescription: "",
            selectedPrice: "",
            selectedCarBrand: "",
            selectedImagePath: "",
            vendorAddress: "",
            vendorNickname: "",
            ipfsPath:"",
            contract: null
        }

    }

    componentDidMount = async () => {
        const contract = await this.state.drizzle.contracts.STMarketplace
        const contractNFTs = await this.state.drizzle.contracts.SimthunderOwner
        const response_cars = await contract.methods.getCarSetups().call();
        const response_skins = await contract.methods.getSkins().call();
        const currentAccount = this.state.drizzleState.accounts[0];
        const nftlist = [];
        
        console.log('componentDidMount');

        // get info from marketplace NFT contract
        let numNfts = await contractNFTs.methods.balanceOf(contractNFTs.address).call();
        console.log('nft count:' + numNfts);
        
        let currentPage = this;
        for (let i = 1; i < 100; i++) {
            try {
                //TODO: change for different ids
                let ownerAddress = await contractNFTs.methods.ownerOf(i).call();
                console.log('ID:'+i+'ownerAddress: '+ownerAddress.toString()+'nfts addr: '+contractNFTs.address);
                if(ownerAddress === contractNFTs.address) {
                    console.log('GOT MATCH');
                    let uri = await contractNFTs.methods.tokenURI(i).call();
                    console.log('uri: ', uri);
                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var data = JSON.parse(this.responseText);
                        console.log('nftData:' + data.image);
                        console.log('nftData:' + data.description);
                        data.id=i;
                        nftlist.push(data);
                        currentPage.setState({ listCars: response_cars, listSkins: response_skins, contract: contract, contractNFTs: contractNFTs, latestNFTs: nftlist });
                    }
                    };
                    xmlhttp.open("GET", uri, true);
                    xmlhttp.send();
                }
            } catch (e) {
                console.log(e);
            }
        }
        
        // $.getJSON(uri, async function (data) {
        //     console.log('nftData:' + data);
        // });
        /**Skins buscar a imagemHash e concatenar
        * --> https://ipfs.io/ipfs/
        */
        /* try {
            const ipfs_results = []
            for await (const resultPart of ipfs.ls('ipfs/')) {
                ipfs_results.push(resultPart)
            }
            if(ipfs_results.empty) {
                console.log("IPFS_results: " + ipfs_results)
            } else {
                console.log("IPFS is empty")
            }
            console.log("IPFS: ", ipfs)
        } catch (e) {
            console.error(e)
        } */
        
        this.setState({ listCars: response_cars, listSkins: response_skins, contract: contract, contractNFTs: contractNFTs, latestNFTs: nftlist });
    }


    buyItem = async (event, itemId, track, simulator, season, series, description, price, carBrand, address, ipfsPath, imagePath, isNFT) => {
        event.preventDefault();

        this.setState({
            redirectBuyItem: true,
            selectedItemId: itemId,
            selectedTrack: track,
            selectedSimulator: simulator,
            selectedSeason: season,
            selectedSeries: series,
            selectedDescription: description,
            selectedPrice: price,
            selectedCarBrand: carBrand,
            selectedImagePath: imagePath,
            vendorAddress: address,
            vendorNickname: address ? await this.state.contract.methods.getNickname(address).call() : "",
            ipfsPath: ipfsPath,
            isNFT: isNFT,
        });
    }

    render() {

        const cars = [];
        const skins = [];
        const nfts = [];


        if (this.state.redirectBuyItem == true) {
            return (<Redirect
                to={{
                    pathname: "/item",
                    state: {
                        selectedItemId: this.state.selectedItemId,
                        selectedTrack: this.state.selectedTrack,
                        selectedSimulator: this.state.selectedSimulator,
                        selectedSeason: this.state.selectedSeason,
                        selectedSeries: this.state.selectedSeries,
                        selectedDescription: this.state.selectedDescription,
                        selectedPrice: this.state.selectedPrice,
                        selectedCarBrand: this.state.selectedCarBrand,
                        imagePath: this.state.selectedImagePath,
                        vendorAddress: this.state.vendorAddress,
                        vendorNickname: this.state.vendorNickname,
                        ipfsPath: this.state.ipfsPath,
                        isNFT: this.state.isNFT,
                    }
                }}
            />)
        }

        if (this.state.listCars != null || this.state.listSkins != null) {

            for (const [index, value] of this.state.listCars.entries()) {
                console.log('list cars value:');
                console.log(value);
                let carBrand = value.info.carBrand
                let track = value.info.track
                let simulator = value.info.simulator
                let season = value.info.season
                let series = value.info.series
                let description = value.info.description
                let price = value.ad.price
                let address = value.ad.seller
                let itemId = value.id
                let ipfsPath = value.ad.ipfsPath
                cars.push(
                    <ListGroup.Item key={index}>
                        <Card className="card-block" key={index}>
                            <Card.Body>
                                <Card.Title>{carBrand}</Card.Title>
                                <Card.Text>
                                    <div><b>Track:</b> {track}</div>
                                    <div><b>Simulator:</b> {simulator}</div>
                                    <div><b>Season:</b> {season}</div>
                                    <div><b>Price:</b> {price / priceConversion} ETH</div>
                                    {/* <div><b>Vendor address:</b> {address}</div> */}
                                </Card.Text>
                                <Button variant="primary" onClick={(e) => this.buyItem(e, itemId, track, simulator, season, series, description, price, carBrand, address, ipfsPath, "", false)}> View item</Button>
                            </Card.Body>
                        </Card>
                    </ListGroup.Item>
                )
            }

            cars.reverse();

            for (const [index, value] of this.state.listSkins.entries()) {
                let carBrand = value.info.carBrand
                let simulator = value.info.simulator
                let price = value.ad.price
                let address = value.ad.seller
                let itemId = value.id
                let ipfsPath = value.ad.ipfsPath
                let imagePath = "https://ipfs.io/ipfs/" + value.info.skinPic
                skins.push(
                    <ListGroup.Item key={index}>
                        <Card className="card-block">
                            <Card.Body>
                                <Card.Img variant="top" src={imagePath} />
                                <Card.Title>{carBrand}</Card.Title>
                                <Card.Text>
                                    <div><b>Simulator:</b> {simulator}</div>
                                    <div><b>Price:</b> {price / priceConversion} ETH</div>
                                    {/* <div><b>Vendor address:</b> {address}</div> */}
                                </Card.Text>
                                <Button variant="primary" onClick={(e) => this.buyItem(e, itemId, null, simulator, null, null, null, price, carBrand , address, ipfsPath, imagePath, false)}> View item</Button>
                            </Card.Body>
                        </Card>
                    </ListGroup.Item>
                )
            }

            skins.reverse();
            console.log('FOR LATEST NFTs antes, size: ' + this.state.latestNFTs.length);
            for (const [index, value] of this.state.latestNFTs.entries()) {
                console.log('FOR LATEST NFTs');
                // let carBrand = value.info.carBrand
                // let simulator = value.info.simulator
                let price = 46*priceConversion;
                //TODO: change hardcode
                let address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
                let itemId = value.id
                // let ipfsPath = value.ad.ipfsPath
                console.log(' ID NFT:'+value.id);
                let imagePath = value.image
                nfts.push(
                    <ListGroup.Item key={index}>
                        <Card className="card-block">
                            <Card.Body>
                                <Card.Img variant="top" src={imagePath} />
                                {/* <Card.Title>{carBrand}</Card.Title> */}
                                <Card.Text>
                                    {/* <div><b>Simulator:</b> {simulator}</div>
                                    <div><b>Price:</b> {price / priceConversion} ETH</div> */}
                                    {/* <div><b>Vendor address:</b> {address}</div> */}
                                </Card.Text>
                                <Button variant="primary" onClick={(e) => this.buyItem(e, itemId, null, null, null, null, null, price, null , address, null, imagePath, true)}> View item</Button>
                            </Card.Body>
                        </Card>
                    </ListGroup.Item>
                )
            }

        }

        return (
            <header className="header">
                <section className="content-section text-light br-n bs-c bp-c pb-8" style={{backgroundImage: 'url(\'/assets/img/bg/bg_shape.png\')'}}>
                    <div id="latest-container" className="container">
                        <div className="center-text">
                            <h1>Welcome to Simthunder!</h1>
                            <h2>The largest marketplace for sim racing assets</h2>
                            <h5>Buy, sell, discover, and trade sim racing goods</h5>
                        </div>
                        <div>
                            <h4>Latest Car Setups</h4>
                        </div>
                        <div>
                            <ListGroup className="list-group list-group-horizontal scrolling-wrapper">
                                {cars}
                            </ListGroup>

                        </div>
                        <br></br>
                        <div>
                            <h4>Latest Car Skins</h4>
                        </div>
                        <div>
                            <ListGroup className="list-group list-group-horizontal scrolling-wrapper">
                                {skins}
                            </ListGroup>
                        </div>
                        <br></br>
                        <div>
                            <h4>Latest Car Ownership NFTs</h4>
                        </div>
                        <div>
                            <ListGroup className="list-group list-group-horizontal scrolling-wrapper">
                                {nfts}
                            </ListGroup>
                        </div>
                    </div>
                </section>
            </header>
        );
    }
}

export default MainPage;