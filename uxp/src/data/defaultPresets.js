/**
 * Default Bin Presets for PremiereBinBuilder
 */
window.DefaultPresets = [
  {
    id: "youtube-documentary",
    name: "YouTube Documentary",
    bins: [
      {
        id: "bin_footage",
        name: "01_FOOTAGE",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_footage_raw", name: "RAW", enabled: true, children: [] },
          { id: "bin_footage_broll", name: "BROLL", enabled: true, children: [] },
          { id: "bin_footage_stock", name: "STOCK", enabled: true, children: [] },
          { id: "bin_footage_archive", name: "ARCHIVE", enabled: true, children: [] },
          { id: "bin_footage_ai_image", name: "AI_IMAGE", enabled: true, children: [] },
          { id: "bin_footage_ai_video", name: "AI_VIDEO", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_audio",
        name: "02_AUDIO",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_audio_vo", name: "VOICE_OVER", enabled: true, children: [] },
          { id: "bin_audio_music", name: "MUSIC", enabled: true, children: [] },
          { id: "bin_audio_sfx", name: "SFX", enabled: true, children: [] },
          { id: "bin_audio_amb", name: "AMBIENCE", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_graphics",
        name: "03_GRAPHICS",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_graphics_png", name: "PNG", enabled: true, children: [] },
          { id: "bin_graphics_mogrt", name: "MOGRT", enabled: true, children: [] },
          { id: "bin_graphics_overlay", name: "OVERLAY", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_sequence",
        name: "04_SEQUENCE",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_sequence_main", name: "MAIN", enabled: true, children: [] },
          { id: "bin_sequence_nest", name: "NEST", enabled: true, children: [] },
          { id: "bin_sequence_export", name: "EXPORT", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_export",
        name: "05_EXPORT",
        enabled: true,
        expanded: true,
        children: []
      }
    ]
  },
  {
    id: "youtube-shorts",
    name: "YouTube Shorts",
    bins: [
      {
        id: "bin_shorts_footage",
        name: "01_FOOTAGE",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_shorts_footage_raw", name: "RAW", enabled: true, children: [] },
          { id: "bin_shorts_footage_broll", name: "BROLL", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_shorts_audio",
        name: "02_AUDIO",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_shorts_audio_vo", name: "VOICE_OVER", enabled: true, children: [] },
          { id: "bin_shorts_audio_music", name: "MUSIC", enabled: true, children: [] },
          { id: "bin_shorts_audio_sfx", name: "SFX", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_shorts_graphics",
        name: "03_GRAPHICS",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_shorts_graphics_assets", name: "ASSETS", enabled: true, children: [] },
          { id: "bin_shorts_graphics_mogrt", name: "MOGRT", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_shorts_export",
        name: "04_EXPORTS",
        enabled: true,
        expanded: true,
        children: []
      }
    ]
  },
  {
    id: "podcast",
    name: "Podcast",
    bins: [
      {
        id: "bin_pod_footage",
        name: "01_FOOTAGE",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_pod_cam_a", name: "CAM_A", enabled: true, children: [] },
          { id: "bin_pod_cam_b", name: "CAM_B", enabled: true, children: [] },
          { id: "bin_pod_cam_c", name: "CAM_C", enabled: true, children: [] },
          { id: "bin_pod_broll", name: "BROLL", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_pod_audio",
        name: "02_AUDIO",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_pod_mic_a", name: "MIC_A", enabled: true, children: [] },
          { id: "bin_pod_mic_b", name: "MIC_B", enabled: true, children: [] },
          { id: "bin_pod_music", name: "MUSIC", enabled: true, children: [] },
          { id: "bin_pod_sfx", name: "SFX", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_pod_sequence",
        name: "03_SEQUENCE",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_pod_seq_main", name: "MAIN_EDIT", enabled: true, children: [] },
          { id: "bin_pod_seq_social", name: "SOCIAL_CLIPS", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_pod_exports",
        name: "04_EXPORTS",
        enabled: true,
        expanded: true,
        children: []
      }
    ]
  },
  {
    id: "commercial",
    name: "Commercial Project",
    bins: [
      {
        id: "bin_comm_footage",
        name: "01_FOOTAGE",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_comm_footage_raw", name: "RAW", enabled: true, children: [] },
          { id: "bin_comm_footage_broll", name: "BROLL", enabled: true, children: [] },
          { id: "bin_comm_footage_proxy", name: "PROXY", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_comm_audio",
        name: "02_AUDIO",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_comm_audio_vo", name: "VOICE", enabled: true, children: [] },
          { id: "bin_comm_audio_music", name: "MUSIC", enabled: true, children: [] },
          { id: "bin_comm_audio_sfx", name: "SFX", enabled: true, children: [] },
          { id: "bin_comm_audio_amb", name: "AMBIENCE", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_comm_graphics",
        name: "03_GRAPHICS",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_comm_graphics_titles", name: "TITLES", enabled: true, children: [] },
          { id: "bin_comm_graphics_logo", name: "LOGO", enabled: true, children: [] },
          { id: "bin_comm_graphics_mogrt", name: "MOGRT", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_comm_sequence",
        name: "04_SEQUENCE",
        enabled: true,
        expanded: true,
        children: [
          { id: "bin_comm_seq_cuts", name: "CUTS", enabled: true, children: [] },
          { id: "bin_comm_seq_deliver", name: "DELIVERABLES", enabled: true, children: [] }
        ]
      },
      {
        id: "bin_comm_exports",
        name: "05_EXPORTS",
        enabled: true,
        expanded: true,
        children: []
      }
    ]
  }
];
