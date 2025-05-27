import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const TopBarHeader = ({
  showTopBar = false,
  topBarTitle,
  onBack,
  style,
  centerTopbarTitle = false,
}) => {
  if (!showTopBar) return null;

   return (
    <SafeAreaView edges={['top']} style={[styles.safeAreaStyle, style]}>
      <View style={styles.topBar}>
        <View style={styles.left}>
          {onBack && (
            <IconButton
              icon="arrow-left"
              onPress={onBack}
              style={styles.backButton}
              iconColor="white"
              size={28}
            />
          )}
        </View>
        <View style={styles.center}>
          <Text
            style={[
              styles.topbarTextTitle,
              centerTopbarTitle && { textAlign: 'center' },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {topBarTitle}
          </Text>
        </View>
        <View style={styles.right} />
      </View>
    </SafeAreaView>
  );
};

export default TopBarHeader;

const styles = StyleSheet.create({
  safeAreaStyle: {
    backgroundColor: '#5124A5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 32,
    paddingHorizontal: 0,
    backgroundColor: '#5124A5',
  },
  left: {
    width: 56,
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: '10%',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    width: 56,
  },
  backButton: {
    marginLeft: 0,
    marginRight: 0,
    alignSelf: 'flex-start',
  },
  topbarTextTitle: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});