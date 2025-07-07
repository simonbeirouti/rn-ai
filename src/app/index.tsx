import { Chat } from "@/components/chat";
import { Channels } from "@/components/channels";
import { CustomTabs } from "@/components/custom-tabs";

export default function Page() {
  const tabs = [
    {
      id: 'main-chat',
      title: 'Main Chat',
      component: <Chat />
    },
    {
      id: 'channels',
      title: 'Channels',
      component: <Channels />
    }
  ];

  return <CustomTabs tabs={tabs} />;
}
