// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;
    
interface TokenTransfer {
    function transfer(address receiver, uint amount) external;
    function transferFrom(address _from, address _to, uint256 _value) external;
}
abstract contract owned {
    address public owner;

     constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) onlyOwner public {
        owner = newOwner;
    }
}
    
contract KyexZetaTrading is owned {
    struct OrderInfo {
        uint256 blockNumber;
        address userAddress;
        address tokenAddress;
        uint256 amount;
        string remarks;
    }
    mapping(uint256 => OrderInfo) public orderInfos;
    uint256 public lastOrderId = 0;
    
    address payable public  pooledAddress;
    address public mainAddress = 0x000000000000000000000000000000000000dEaD;
    
     constructor (address payable _pooledAddress) {
        pooledAddress = _pooledAddress;
    }
  
    function transaction(address tokenAddress,uint256 amount,string memory remarks) external payable {
        if(tokenAddress == mainAddress){
           pooledAddress.transfer(amount);
        }else{
            TokenTransfer(tokenAddress).transferFrom(msg.sender,pooledAddress,amount);
        }
        OrderInfo memory orderInfo = OrderInfo({
            blockNumber: block.number,
            userAddress: msg.sender,
            tokenAddress: tokenAddress,
            amount: amount,
            remarks: remarks
        });
        lastOrderId = lastOrderId+1;
        orderInfos[lastOrderId] = orderInfo;
    }
    function withdrawalManage(address payable userAddress,address tokenAddress,uint256 amount) external onlyOwner{
        if(tokenAddress == mainAddress){
            userAddress.transfer(amount);
        }else{
            TokenTransfer(tokenAddress).transfer(userAddress,amount);
        }
    }
   
    function setPooledAddress(address payable _pooledAddress) external onlyOwner{
        pooledAddress = _pooledAddress;
    }
    function setMainAddress(address _mainAddress) external onlyOwner{
        mainAddress = _mainAddress;
    }
}