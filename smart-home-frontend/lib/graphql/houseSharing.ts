import { gql } from '@apollo/client';

export const CREATE_HOUSE_INVITATION = gql`
  mutation CreateHouseInvitation($input: CreateHouseInvitationInput!) {
    createHouseInvitation(input: $input) {
      invitation {
        id
        houseId
        inviteCode
        role
        expiryDate
        status
        createdDate
      }
      inviteLink
    }
  }
`;

export const ACCEPT_HOUSE_INVITATION = gql`
  mutation AcceptHouseInvitation($input: AcceptHouseInvitationInput!) {
    acceptHouseInvitation(input: $input) {
      id
      name
      description
      userRole
      createdDate
    }
  }
`;

export const REVOKE_HOUSE_INVITATION = gql`
  mutation RevokeHouseInvitation($invitationId: ID!) {
    revokeHouseInvitation(invitationId: $invitationId)
  }
`;

export const REMOVE_HOUSE_SHARE = gql`
  mutation RemoveHouseShare($shareId: ID!) {
    removeHouseShare(shareId: $shareId)
  }
`;

export const UPDATE_HOUSE_SHARE_ROLE = gql`
  mutation UpdateHouseShareRole($shareId: ID!, $role: HouseRole!) {
    updateHouseShareRole(shareId: $shareId, role: $role) {
      id
      role
      user {
        id
        name
        email
      }
    }
  }
`;

export const GET_SHARED_HOUSES = gql`
  query GetSharedHouses {
    sharedHouses {
      id
      name
      description
      userRole
      createdDate
      user {
        id
        name
        email
      }
    }
  }
`;

export const GET_HOUSE_INVITATIONS = gql`
  query GetHouseInvitations($houseId: ID!) {
    houseInvitations(houseId: $houseId) {
      id
      inviteCode
      role
      expiryDate
      status
      createdDate
      usedDate
      invitedUserId
    }
  }
`;

export const GET_HOUSE_SHARES = gql`
  query GetHouseShares($houseId: ID!) {
    houseShares(houseId: $houseId) {
      id
      role
      createdAt
      user {
        id
        name
        email
        avatar
      }
    }
  }
`;
