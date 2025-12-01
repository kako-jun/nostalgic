interface FeaturesIntroProps {
  serviceName: string;
  serviceIcon: string;
  features: {
    emoji: string;
    title: string;
    description: string;
  }[];
}

export default function FeaturesIntro({ serviceName, serviceIcon, features }: FeaturesIntroProps) {
  return (
    <div className="nostalgic-content">
      <div className="nostalgic-title">
        {serviceIcon} Nostalgic {serviceName} {serviceIcon}
        <br />
        機能
      </div>

      {features.map((feature, index) => (
        <div key={index} className="nostalgic-section">
          <p>
            <span className="nostalgic-section-title">
              <b>
                {feature.emoji} {feature.title} {feature.emoji}
              </b>
            </span>
          </p>
          <p dangerouslySetInnerHTML={{ __html: feature.description }} />
        </div>
      ))}
    </div>
  );
}
