import { gql } from '@apollo/client';

export const GET_HOUSEHOLD = gql`
  query GetHousehold($userId: ID!) {
    household(userId: $userId) {
      id
      name
      description
      createdAt
      updatedAt
      members {
        id
        name
        email
        avatar
        role
        joinedAt
        lastActive
      }
      kitchens {
        id
        name
        description
        createdAt
        inventoryItems {
          id
          name
          category
          quantity
          status
        }
      }
      settings {
        currency
        timezone
        language
        notifications {
          expiryAlerts
          lowStockAlerts
          shoppingReminders
        }
      }
    }
  }
`;

export const CREATE_HOUSEHOLD = gql`
  mutation CreateHousehold($input: CreateHouseholdInput!) {
    createHousehold(input: $input) {
      id
      name
      description
      createdAt
      members {
        id
        name
        email
        role
      }
    }
  }
`;

export const UPDATE_HOUSEHOLD = gql`
  mutation UpdateHousehold($id: ID!, $input: UpdateHouseholdInput!) {
    updateHousehold(id: $id, input: $input) {
      id
      name
      description
      updatedAt
      settings {
        currency
        timezone
        language
      }
    }
  }
`;

export const DELETE_HOUSEHOLD = gql`
  mutation DeleteHousehold($id: ID!) {
    deleteHousehold(id: $id) {
      success
      message
    }
  }
`;

export const ADD_HOUSEHOLD_MEMBER = gql`
  mutation AddHouseholdMember($householdId: ID!, $email: String!, $role: String = "member") {
    addHouseholdMember(householdId: $householdId, email: $email, role: $role) {
      id
      name
      email
      role
      joinedAt
      invitationStatus
    }
  }
`;

export const REMOVE_HOUSEHOLD_MEMBER = gql`
  mutation RemoveHouseholdMember($householdId: ID!, $memberId: ID!) {
    removeHouseholdMember(householdId: $householdId, memberId: $memberId) {
      success
      message
    }
  }
`;

export const UPDATE_MEMBER_ROLE = gql`
  mutation UpdateMemberRole($householdId: ID!, $memberId: ID!, $role: String!) {
    updateMemberRole(householdId: $householdId, memberId: $memberId, role: $role) {
      id
      role
      updatedAt
    }
  }
`;

export const CREATE_KITCHEN = gql`
  mutation CreateKitchen($input: CreateKitchenInput!) {
    createKitchen(input: $input) {
      id
      name
      description
      createdAt
      householdId
    }
  }
`;

export const UPDATE_KITCHEN = gql`
  mutation UpdateKitchen($id: ID!, $input: UpdateKitchenInput!) {
    updateKitchen(id: $id, input: $input) {
      id
      name
      description
      updatedAt
    }
  }
`;

export const DELETE_KITCHEN = gql`
  mutation DeleteKitchen($id: ID!) {
    deleteKitchen(id: $id) {
      success
      message
    }
  }
`;

export const GET_HOUSEHOLD_STATS = gql`
  query GetHouseholdStats($householdId: ID!) {
    householdStats(householdId: $householdId) {
      totalMembers
      activeMembers
      totalKitchens
      totalInventoryItems
      totalShoppingLists
      totalRecipes
      monthlyExpenses
      wasteReduction
      memberActivity {
        memberId
        memberName
        lastActive
        activityScore
        contributions {
          inventoryItems
          shoppingLists
          recipes
        }
      }
    }
  }
`;

export const GET_HOUSEHOLD_ACTIVITY = gql`
  query GetHouseholdActivity($householdId: ID!, $limit: Int = 20) {
    householdActivity(householdId: $householdId, limit: $limit) {
      id
      type
      description
      createdAt
      user {
        id
        name
        avatar
      }
      metadata {
        itemName
        listName
        recipeName
        kitchenName
      }
    }
  }
`;

export const INVITE_HOUSEHOLD_MEMBER = gql`
  mutation InviteHouseholdMember($householdId: ID!, $email: String!, $role: String = "member", $message: String) {
    inviteHouseholdMember(householdId: $householdId, email: $email, role: $role, message: $message) {
      success
      message
      invitation {
        id
        email
        role
        status
        expiresAt
      }
    }
  }
`;

export const ACCEPT_HOUSEHOLD_INVITATION = gql`
  mutation AcceptHouseholdInvitation($token: String!) {
    acceptHouseholdInvitation(token: $token) {
      success
      message
      household {
        id
        name
        members {
          id
          name
          role
        }
      }
    }
  }
`;

export const DECLINE_HOUSEHOLD_INVITATION = gql`
  mutation DeclineHouseholdInvitation($token: String!) {
    declineHouseholdInvitation(token: $token) {
      success
      message
    }
  }
`;

export const GET_HOUSEHOLD_INVITATIONS = gql`
  query GetHouseholdInvitations($householdId: ID!) {
    householdInvitations(householdId: $householdId) {
      id
      email
      role
      status
      createdAt
      expiresAt
      invitedBy {
        id
        name
      }
    }
  }
`;

export const CANCEL_HOUSEHOLD_INVITATION = gql`
  mutation CancelHouseholdInvitation($id: ID!) {
    cancelHouseholdInvitation(id: $id) {
      success
      message
    }
  }
`;

export const LEAVE_HOUSEHOLD = gql`
  mutation LeaveHousehold($householdId: ID!) {
    leaveHousehold(householdId: $householdId) {
      success
      message
    }
  }
`;

export const TRANSFER_HOUSEHOLD_OWNERSHIP = gql`
  mutation TransferHouseholdOwnership($householdId: ID!, $newOwnerId: ID!) {
    transferHouseholdOwnership(householdId: $householdId, newOwnerId: $newOwnerId) {
      success
      message
      household {
        id
        members {
          id
          name
          role
        }
      }
    }
  }
`;