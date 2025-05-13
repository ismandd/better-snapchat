import React from 'react';
import { Radio, Stack } from '@mantine/core';
import useSettingState from '../../../../hooks/useSettingState';
import { PeekingNotification } from '../../../../lib/constants';

const NAME = 'Peeking Notification';

const OFF_NAME = 'Off';
const OFF_DESCRIPTION = 'No Notifications.';

const DEFAULT_NAME = 'Default';
const DEFAULT_DESCRIPTION = 'Do what Snapchat normally does.';

const STAY_NAME = 'Stay';
const STAY_DESCRIPTION = 'Peeking eyes will stay after a message has been peeked.';

function PeekingSettings() {
  const [peekingnotification, setPeekingNotification] = useSettingState('HALF_SWIPE_NOTIFICATION');
  return (
    <Radio.Group
      label={NAME}
      value={peekingnotification}
      onChange={(value) => setPeekingNotification(value as PeekingNotification)}
    >
      <Stack>
        <Radio value={PeekingNotification.OFF} label={OFF_NAME} description={OFF_DESCRIPTION} />
        <Radio value={PeekingNotification.DEFAULT} label={DEFAULT_NAME} description={DEFAULT_DESCRIPTION} />
        <Radio value={PeekingNotification.STAY} label={STAY_NAME} description={STAY_DESCRIPTION} />
      </Stack>
    </Radio.Group>
  );
}

export default {
 name: [NAME, OFF_NAME, DEFAULT_NAME],
  description: [OFF_DESCRIPTION, DEFAULT_DESCRIPTION],
  component: PeekingSettings,
};
