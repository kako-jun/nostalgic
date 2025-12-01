interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  currentTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabNavigation({ tabs, currentTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="nostalgic-nav">
      <ul className="nostalgic-nav-list">
        {tabs.map((tab) => (
          <li key={tab.id} className="nostalgic-nav-item">
            <a
              href={`#${tab.id}`}
              className={currentTab === tab.id ? "nostalgic-nav-link active" : "nostalgic-nav-link"}
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = tab.id;
                onTabChange(tab.id);
              }}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
