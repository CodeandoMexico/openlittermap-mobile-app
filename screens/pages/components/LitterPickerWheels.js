import React, { PureComponent } from 'react';
import { Dimensions, Platform, View, StyleSheet } from 'react-native';
import { getTranslation } from 'react-native-translation';
import { Picker } from '@react-native-community/picker'; // removed from RN-core Apr 2020
import { connect } from 'react-redux';

import DeviceInfo from 'react-native-device-info';

import * as actions from '../../../actions';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Creating array of quantities [1 --- 100]
const QUANTITIES = [...Array(100).keys()].map(i => i + 1);
class LitterPickerWheels extends PureComponent {
    /**
     *
     */
    _computeContainer() {
        if (Platform.OS === 'android') return styles.pickerViewAndroid;

        // if "iPhone 10+", return 17% card height
        let x = DeviceInfo.getModel().split(' ')[1];

        if (x.includes('X') || parseInt(x) >= 10) return styles.iPickerView;

        return styles.pickerViewiOS;
    }

    /**
     *
     */
    _computePickerWheel() {
        if (Platform.OS === 'android') return styles.pickerWheel;

        // if "iPhone 10+", return 17% card height
        let x = DeviceInfo.getModel().split(' ')[1];

        if (x.includes('X') || parseInt(x) >= 10) return styles.iPickerWheel;

        return styles.pickerWheel;
    }

    render() {
        return (
            <View style={this._computeContainer()}>
                <Picker
                    itemStyle={this._computePickerWheel()}
                    style={{ width: SCREEN_WIDTH * 0.7 }}
                    selectedValue={this.props.item}
                    onValueChange={item => this.props.changeItem(item)}>
                    {this.props.items.map((item, i) => {
                        const x = getTranslation(
                            `${this.props.lang}.litter.${
                                this.props.category.title
                            }.${item}`
                        );

                        return <Picker.Item label={x} value={item} key={i} />;
                    })}
                </Picker>
                <Picker
                    itemStyle={this._computePickerWheel()}
                    style={{ width: SCREEN_WIDTH * 0.3 }}
                    selectedValue={this.props.q}
                    onValueChange={q => this.props.changeQ(q)}>
                    {QUANTITIES.map((q, i) => (
                        <Picker.Item label={q.toString()} value={q} key={i} />
                    ))}
                </Picker>
            </View>
        );
    }

    getText(item) {
        return item;
    }
}

const styles = StyleSheet.create({
    iPickerView: {
        flexDirection: 'row',
        backgroundColor: '#95a5a6',
        height: SCREEN_HEIGHT * 0.125,
        opacity: 1
    },
    pickerViewiOS: {
        flexDirection: 'row',
        backgroundColor: '#95a5a6',
        height: SCREEN_HEIGHT * 0.15,
        opacity: 1
    },
    // itemStyle is iOS only
    pickerWheel: {
        fontSize: SCREEN_HEIGHT * 0.03,
        height: SCREEN_HEIGHT * 0.15,
        fontWeight: 'bold'
    },
    iPickerWheel: {
        fontSize: SCREEN_HEIGHT * 0.03,
        height: SCREEN_HEIGHT * 0.125,
        fontWeight: 'bold'
    },
    pickerViewAndroid: {
        flexDirection: 'row',
        backgroundColor: '#95a5a6',
        height: SCREEN_HEIGHT * 0.1,
        opacity: 1,
        alignItems: 'center'
    }
});

export default connect(
    null,
    actions
)(LitterPickerWheels);
