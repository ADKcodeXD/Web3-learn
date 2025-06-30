// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

/// @title Voting with delegation.
contract Ballot {
    struct Voter {
        bool voted; // if true, that person already voted
        uint vote; // index of the voted proposal
    }

    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    mapping(address => Voter) public voters;

    Proposal[] public proposals;

    constructor(bytes32[] memory proposalNames) {
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint proposal) external {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += 1;
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }

    function getProposals() external view returns (Proposal[] memory) {
        return proposals;
    }
}
