/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable no-unused-vars */
import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import { useEffect } from "react";
import { useState } from "react";
import abi from "../src/utils/WavePortal.json"
import { createAvatar } from '@dicebear/avatars';
import * as style from '@dicebear/avatars-identicon-sprites';

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

  const contractAddress = "0xDb1eC9dbD18481c41847A5Cd1eB8e9D3e64CEAc8";

  const contractABI = abi.abi;

  let svg = createAvatar(style, {
    seed: currentAccount,
    // ... and other options
  });

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves()

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setAllWaves(wavesCleaned.reverse());
      }
    } catch (error) {

    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have Metamask!");
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    if(!currentAccount){
      alert("Connect your MetaMask wallet to continue!");
      return;
    }
    
    if(!message){
      alert("Enter message to continue!");
      return;
    }
    
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(message);
        setMessage("");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        getAllWaves();
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllWaves();
  },[])

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer" style={{ background: "url('background.jpg')", backgroundColor: '#09BEDE' }}>

      <div className="dataContainer">
        <div className="header text-red-500">
          👋 Hey there!
        </div>

        <div className="bio">
          I am Didier and I'm a self taught developer, pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>
        <input type="text" maxLength={200} minLength={10} onChange={(e) => setMessage(e.target.value)} onSubmit={wave} placeholder="Enter a message, it will be stored on the blockchain forever 😉"  style={{ padding: "16px", borderRadius: "8px", outlineColor: "#09BEDE", borderWidth: "1px" , marginTop: "16px", marginBottom: "16px"}}/>
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ background: "rgba(45, 209, 239, 0.43)",  borderRadius: "8px", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)" , backdropFilter: "blur(6.5px)", WebkitBackdropFilter: "blur(6.5px)",border: "1px solid rgba(45, 209, 239, 0.51)", marginTop: "20px", marginBottom: "20px", padding: "12px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
