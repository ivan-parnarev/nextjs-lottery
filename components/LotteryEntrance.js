import { useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { abi, contractAddresses } from '../constants';
import { ethers } from 'ethers';
import { useNotification } from 'web3uikit';

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const lotteryAddress =
        chainId in contractAddresses ? contractAddresses[chainId][0] : null;

    const [entranceFee, setEntranceFee] = useState('0');
    const [numParticipants, setNumParticipants] = useState('0');
    const [recentWinner, setRecentWinner] = useState('0');

    const dispatch = useNotification();

    const {
        runContractFunction: joinLottery,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: 'joinLottery',
        params: {},
        msgValue: entranceFee,
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: 'getEntranceFee',
        params: {},
    });

    const { runContractFunction: getNumberOfParticipants } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: 'getNumberOfParticipants',
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: 'getRecentWinner',
        params: {},
    });

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        const numParticipantsFromCall = (
            await getNumberOfParticipants()
        ).toString();
        const recentWinnerFromCall = await getRecentWinner();
        setEntranceFee(entranceFeeFromCall);
        setNumParticipants(numParticipantsFromCall);
        setRecentWinner(recentWinnerFromCall);
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const handleSuccess = async function (tx) {
        await tx.wait(1);
        handleNewNotification(tx);
        updateUI();
    };

    const handleNewNotification = function () {
        dispatch({
            type: 'info',
            message: 'Transaction Complete!',
            title: 'Transaction Notification',
            position: 'topR',
            icon: 'bell',
        });
    };

    return (
        <div className="p-5">
            Lottery Entrance!
            {lotteryAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await joinLottery({ onSuccess: handleSuccess });
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Lottery</div>
                        )}
                    </button>
                    <div>
                        Entrance Fee:
                        {ethers.utils.formatUnits(entranceFee, 'ether')} ETH
                    </div>
                    <div>
                        The current number of players is: {numParticipants}
                    </div>
                    <div>The most previous winner was: {recentWinner}</div>
                </div>
            ) : (
                <div>No Lottery Address Detected!</div>
            )}
        </div>
    );
}
