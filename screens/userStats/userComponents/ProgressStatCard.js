import React from 'react';
import { View } from 'react-native';
import { CountUp } from 'use-count-up';
import { Title, Body, Caption } from '../../components';

const ProgressStatCard = ({
    value,
    title,
    tagline,
    color,
    style,
    taglineCount
}) => {
    return (
        <View
            style={[
                style,
                {
                    borderRadius: 8,
                    paddingLeft: 10,
                    paddingVertical: 10
                }
            ]}>
            <Title style={{ color }}>
                <CountUp
                    isCounting
                    end={value}
                    duration={5}
                    shouldUseToLocaleString
                />
            </Title>
            <Body style={{ color }} dictionary={title} />
            <Caption dictionary={tagline} values={{ count: taglineCount }} />
        </View>
    );
};

export default ProgressStatCard;
