import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import { useHouseSharing, useHouseInvitations, useHouseShares } from '../../../hooks/useHouseSharing';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

type HouseRole = 'READ' | 'WRITE';

export default function HouseSharingScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedRole, setSelectedRole] = useState<HouseRole>('READ');
  const [expiryDays, setExpiryDays] = useState(7);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedShare, setSelectedShare] = useState<any>(null);

  const {
    createHouseInvitation,
    revokeHouseInvitation,
    removeHouseShare,
    updateHouseShareRole,
  } = useHouseSharing();

  const {
    invitations,
    loading: invitationsLoading,
    refetch: refetchInvitations,
  } = useHouseInvitations(id!);

  const {
    shares,
    loading: sharesLoading,
    refetch: refetchShares,
  } = useHouseShares(id!);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchInvitations(), refetchShares()]);
    setRefreshing(false);
  };

  const handleCreateInvitation = async () => {
    setIsCreatingInvite(true);
    try {
      await createHouseInvitation(id!, selectedRole, expiryDays);
      await refetchInvitations();
    } catch (error) {
      console.error('Error creating invitation:', error);
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    Alert.alert(
      'Revoke Invitation',
      'Are you sure? The link will no longer work.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeHouseInvitation(invitationId);
              await refetchInvitations();
            } catch (error) {
              console.error('Error revoking invitation:', error);
            }
          },
        },
      ]
    );
  };

  const handleRemoveShare = async (share: any) => {
    const success = await removeHouseShare(share.id, share.user.name || share.user.email);
    if (success) {
      await refetchShares();
    }
  };

  const handleUpdateRole = async (share: any, newRole: HouseRole) => {
    try {
      await updateHouseShareRole(share.id, newRole, share.user.name || share.user.email);
      await refetchShares();
      setShowRoleDialog(false);
      setSelectedShare(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const getRoleBadgeColor = (role: HouseRole) => {
    return role === 'WRITE' ? '#10b981' : '#3b82f6';
  };

  const getRoleIcon = (role: HouseRole) => {
    return role === 'WRITE' ? 'create-outline' : 'eye-outline';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (invitationsLoading || sharesLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header - Back Button and Title in Same Row */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? '#374151' : '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons name="people" size={26} color="#3B82F6" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
            House Sharing
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Create Invitation Section */}
        <Card style={{ margin: 16, padding: 18, borderRadius: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
            Create Invitation Link
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 }}>
            Share your house inventory with others
          </Text>

          {/* Role Selection */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
              Access Level
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: selectedRole === 'READ' ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb'),
                  backgroundColor: selectedRole === 'READ' ? '#3b82f6' : (isDark ? '#1F2937' : '#fff'),
                  alignItems: 'center',
                }}
                onPress={() => setSelectedRole('READ')}
              >
                <Ionicons
                  name="eye-outline"
                  size={20}
                  color={selectedRole === 'READ' ? '#fff' : '#3b82f6'}
                />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: selectedRole === 'READ' ? '#fff' : colors.text,
                  marginTop: 6,
                }}>
                  View Only
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: selectedRole === 'WRITE' ? '#10b981' : (isDark ? '#374151' : '#e5e7eb'),
                  backgroundColor: selectedRole === 'WRITE' ? '#10b981' : (isDark ? '#1F2937' : '#fff'),
                  alignItems: 'center',
                }}
                onPress={() => setSelectedRole('WRITE')}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={selectedRole === 'WRITE' ? '#fff' : '#10b981'}
                />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: selectedRole === 'WRITE' ? '#fff' : colors.text,
                  marginTop: 6,
                }}>
                  Edit Access
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Expiry Selection */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
              Expires In
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[1, 7, 30].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: expiryDays === days ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb'),
                    backgroundColor: expiryDays === days ? '#eff6ff' : (isDark ? '#1F2937' : '#fff'),
                    alignItems: 'center',
                  }}
                  onPress={() => setExpiryDays(days)}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: expiryDays === days ? '700' : '500',
                    color: expiryDays === days ? '#3b82f6' : colors.textSecondary,
                  }}>
                    {days} {days === 1 ? 'Day' : 'Days'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title={isCreatingInvite ? 'Creating...' : 'Create & Share Link'}
            onPress={handleCreateInvitation}
            disabled={isCreatingInvite}
          />
        </Card>

        {/* Active Shares Section */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
            People with Access ({shares.length})
          </Text>
          {shares.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="No shared access yet"
              description="Create an invitation link to share your house"
            />
          ) : (
            shares.map((share: any) => (
              <Card key={share.id} style={{ padding: 14, marginBottom: 10, borderRadius: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Avatar
                      user={{
                        name: share.user.name || share.user.email,
                        email: share.user.email,
                        avatar: share.user.avatar,
                      }}
                      size={36}
                    />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                        {share.user.name || 'Unknown User'}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        {share.user.email}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 12,
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      gap: 4,
                    }}
                    onPress={() => {
                      setSelectedShare(share);
                      setShowRoleDialog(true);
                    }}
                  >
                    <Ionicons
                      name={getRoleIcon(share.role)}
                      size={12}
                      color={getRoleBadgeColor(share.role)}
                    />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: getRoleBadgeColor(share.role) }}>
                      {share.role === 'WRITE' ? 'Edit' : 'View'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#f3f4f6' }}>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                    Added {formatDate(share.createdAt)}
                  </Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    onPress={() => handleRemoveShare(share)}
                  >
                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                    <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: '600' }}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Pending Invitations Section - Compact */}
        <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
            Pending Invitations ({invitations.filter((i: any) => i.status === 'PENDING').length})
          </Text>
          {invitations.filter((i: any) => i.status === 'PENDING').length === 0 ? (
            <EmptyState
              icon="mail-outline"
              title="No pending invitations"
              description="Create a new invitation link above"
            />
          ) : (
            invitations
              .filter((i: any) => i.status === 'PENDING')
              .map((invitation: any) => (
                <Card key={invitation.id} style={{ padding: 12, marginBottom: 8, borderRadius: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons
                        name={getRoleIcon(invitation.role)}
                        size={14}
                        color={getRoleBadgeColor(invitation.role)}
                      />
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                        {invitation.role === 'WRITE' ? 'Edit Access' : 'View Only'}
                      </Text>
                    </View>
                    <Badge variant={invitation.status === 'PENDING' ? 'warning' : 'success'}>
                      {invitation.status}
                    </Badge>
                  </View>
                  
                  {/* Compact Code Display */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isDark ? '#1F2937' : '#f9fafb',
                      padding: 10,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                    onPress={async () => {
                      await Clipboard.setStringAsync(invitation.inviteCode);
                      Alert.alert('✓ Copied', 'Invitation code copied to clipboard');
                    }}
                  >
                    <Text style={{
                      flex: 1,
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: colors.text,
                      marginRight: 8,
                    }} numberOfLines={1}>
                      {invitation.inviteCode}
                    </Text>
                    <Ionicons name="copy-outline" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      {isExpired(invitation.expiryDate) ? (
                        <Text style={{ color: '#ef4444', fontWeight: '600' }}>Expired</Text>
                      ) : (
                        `Expires ${formatDate(invitation.expiryDate)}`
                      )}
                    </Text>
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: '#fef2f2',
                      }}
                      onPress={() => handleRevokeInvitation(invitation.id)}
                    >
                      <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: '600' }}>
                        Revoke
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
          )}
        </View>
      </ScrollView>

      {/* Role Change Dialog */}
      {showRoleDialog && selectedShare && (
        <ConfirmDialog
          visible={showRoleDialog}
          title="Change Access Level"
          message={`Update access for ${selectedShare.user.name || selectedShare.user.email}?`}
          onConfirm={() => {
            const newRole = selectedShare.role === 'READ' ? 'WRITE' : 'READ';
            handleUpdateRole(selectedShare, newRole);
          }}
          onClose={() => {
            setShowRoleDialog(false);
            setSelectedShare(null);
          }}
          confirmText={`Change to ${selectedShare.role === 'READ' ? 'Edit' : 'View Only'}`}
          cancelText="Cancel"
        />
      )}
    </SafeAreaView>
  );
}
