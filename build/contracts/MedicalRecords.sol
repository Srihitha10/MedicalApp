// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract MedicalRecords {
    struct Record {
        string ipfsHash;
        uint256 timestamp;
        address owner;
    }
    
    mapping(address => Record[]) private records;
    
    event RecordAdded(address indexed patient, string ipfsHash);
    
    function addRecord(string memory _ipfsHash) public {
        records[msg.sender].push(Record({
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            owner: msg.sender
        }));
        
        emit RecordAdded(msg.sender, _ipfsHash);
    }
}