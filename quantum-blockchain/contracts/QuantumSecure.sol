// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract QuantumSecure {
    address public owner;
    mapping(address => uint256) public balances;

    event Transaction(address indexed from, address indexed to, uint256 amount);

    constructor() {
        owner = msg.sender; // Contract creator is the owner
    }

    function sendFunds(address recipient, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[recipient] += amount;

        emit Transaction(msg.sender, recipient, amount);
    }

    function depositFunds() public payable {
        balances[msg.sender] += msg.value;
    }
}
