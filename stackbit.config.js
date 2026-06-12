import { defineStackbitConfig } from '@stackbit/types';
import { GitContentSource } from '@stackbit/cms-git';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define nested object models used inside the sections array
const LinkModel = {
  name: 'Link',
  type: 'object',
  label: 'Link',
  fields: [
    { name: 'url', type: 'string', required: true },
    { name: 'label', type: 'string', required: true }
  ]
};

const HeroModel = {
  name: 'Hero',
  type: 'object',
  label: 'Hero Section',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'subtitle', type: 'string' }
  ]
};

const SectionModel = {
  name: 'Section',
  type: 'object',
  label: 'Standard Section',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'content', type: 'markdown' },
    { name: 'backgroundColor', type: 'enum', options: ['white', 'blue', 'gray'] },
    { name: 'image', type: 'image' },
    { name: 'imagePosition', type: 'enum', options: ['left', 'right', 'center'] },
    { name: 'imageCaption', type: 'string' }
  ]
};

const EventModel = {
  name: 'Event',
  type: 'object',
  label: 'Event Card',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'date', type: 'string', required: true },
    { name: 'time', type: 'string' },
    { name: 'location', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'longDescription', type: 'markdown' },
    { name: 'link', type: 'string' },
    { name: 'linkText', type: 'string' },
    { name: 'image', type: 'image' },
    { name: 'tag', type: 'string' }
  ]
};

const EventGridModel = {
  name: 'EventGrid',
  type: 'object',
  label: 'Events Grid',
  fields: [
    { name: 'title', type: 'string' },
    {
      name: 'events',
      type: 'list',
      items: { type: 'model', models: ['Event'] }
    }
  ]
};

const CommunityModel = {
  name: 'Community',
  type: 'object',
  label: 'Community',
  fields: [
    { name: 'name', type: 'string', required: true },
    { name: 'category', type: 'string' },
    { name: 'image', type: 'image' },
    { name: 'description', type: 'string' },
    { name: 'longDescription', type: 'string' },
    {
      name: 'links',
      type: 'list',
      items: { type: 'model', models: ['Link'] }
    }
  ]
};

const CommunitySpotlightModel = {
  name: 'CommunitySpotlight',
  type: 'object',
  label: 'Community Spotlight',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'community', type: 'model', models: ['Community'] }
  ]
};

const CommunityGridModel = {
  name: 'CommunityGrid',
  type: 'object',
  label: 'Community Grid',
  fields: [
    { name: 'title', type: 'string' },
    {
      name: 'communities',
      type: 'list',
      items: { type: 'model', models: ['Community'] }
    }
  ]
};

const LpjItemModel = {
  name: 'LpjItem',
  type: 'object',
  label: 'LPJ Document Item',
  fields: [
    { name: 'year', type: 'string', required: true },
    { name: 'url', type: 'string', required: true }
  ]
};

const LpjListModel = {
  name: 'LpjList',
  type: 'object',
  label: 'LPJ List',
  fields: [
    {
      name: 'items',
      type: 'list',
      items: { type: 'model', models: ['LpjItem'] }
    }
  ]
};

const ExecutiveBoardModel = {
  name: 'ExecutiveBoard',
  type: 'object',
  label: 'Executive Board',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'chair', type: 'string' },
    { name: 'vice', type: 'string' }
  ]
};

const DepartmentModel = {
  name: 'Department',
  type: 'object',
  label: 'Department',
  fields: [
    { name: 'name', type: 'string', required: true },
    { name: 'description', type: 'string' },
    { name: 'members', type: 'list', items: { type: 'string' } }
  ]
};

const DepartmentListModel = {
  name: 'DepartmentList',
  type: 'object',
  label: 'Department List',
  fields: [
    {
      name: 'departments',
      type: 'list',
      items: { type: 'model', models: ['Department'] }
    }
  ]
};

const PastChairModel = {
  name: 'PastChair',
  type: 'object',
  label: 'Past Chair Info',
  fields: [
    { name: 'name', type: 'string', required: true },
    { name: 'period', type: 'string', required: true }
  ]
};

const CabinetModel = {
  name: 'Cabinet',
  type: 'object',
  label: 'Cabinet Info',
  fields: [
    { name: 'period', type: 'string', required: true },
    { name: 'chair', type: 'string', required: true },
    { name: 'vice', type: 'string' },
    { name: 'image', type: 'image' },
    {
      name: 'departments',
      type: 'list',
      items: { type: 'model', models: ['Department'] }
    }
  ]
};

const CabinetArchiveModel = {
  name: 'CabinetArchive',
  type: 'object',
  label: 'Cabinet Archive',
  fields: [
    { name: 'title', type: 'string' },
    {
      name: 'pastChairs',
      type: 'list',
      items: { type: 'model', models: ['PastChair'] }
    },
    {
      name: 'cabinets',
      type: 'list',
      items: { type: 'model', models: ['Cabinet'] }
    }
  ]
};

const ContactModel = {
  name: 'Contact',
  type: 'object',
  label: 'Contact Info',
  fields: [
    { name: 'role', type: 'string', required: true },
    { name: 'email', type: 'string' },
    { name: 'whatsapp', type: 'string' },
    { name: 'whatsappLink', type: 'string' },
    { name: 'address', type: 'string' },
    { name: 'addressLink', type: 'string' },
    { name: 'image', type: 'image' }
  ]
};

const ContactListModel = {
  name: 'ContactList',
  type: 'object',
  label: 'Contact List',
  fields: [
    { name: 'title', type: 'string' },
    {
      name: 'contacts',
      type: 'list',
      items: { type: 'model', models: ['Contact'] }
    }
  ]
};

const PressKitHeaderModel = {
  name: 'PressKitHeader',
  type: 'object',
  label: 'Press Kit Header',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'subtitle', type: 'string' },
    { name: 'downloadLink', type: 'string' },
    { name: 'downloadText', type: 'string' }
  ]
};

const LogoModel = {
  name: 'Logo',
  type: 'object',
  label: 'Logo Asset',
  fields: [
    { name: 'name', type: 'string', required: true },
    { name: 'image', type: 'image', required: true }
  ]
};

const LogoGridModel = {
  name: 'LogoGrid',
  type: 'object',
  label: 'Logo Grid',
  fields: [
    {
      name: 'logos',
      type: 'list',
      items: { type: 'model', models: ['Logo'] }
    }
  ]
};

const IframeSectionModel = {
  name: 'IframeSection',
  type: 'object',
  label: 'Iframe Embed Section',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'src', type: 'string', required: true }
  ]
};

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  ssgName: 'custom',
  devCommand: 'npm run dev',
  buildCommand: 'npm run build',
  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ['content'],
      models: [
        {
          name: 'Page',
          type: 'page',
          urlPath: '/{slug}',
          filePath: 'content/pages/{slug}.json',
          fields: [
            { name: 'title', type: 'string', required: true },
            { name: 'slug', type: 'string', required: true },
            {
              name: 'sections',
              type: 'list',
              items: {
                type: 'model',
                models: [
                  'Hero',
                  'Section',
                  'EventGrid',
                  'CommunitySpotlight',
                  'CommunityGrid',
                  'LpjList',
                  'ExecutiveBoard',
                  'DepartmentList',
                  'CabinetArchive',
                  'ContactList',
                  'PressKitHeader',
                  'LogoGrid',
                  'IframeSection'
                ]
              }
            }
          ]
        },
        LinkModel,
        HeroModel,
        SectionModel,
        EventModel,
        EventGridModel,
        CommunityModel,
        CommunitySpotlightModel,
        CommunityGridModel,
        LpjItemModel,
        LpjListModel,
        ExecutiveBoardModel,
        DepartmentModel,
        DepartmentListModel,
        PastChairModel,
        CabinetModel,
        CabinetArchiveModel,
        ContactModel,
        ContactListModel,
        PressKitHeaderModel,
        LogoModel,
        LogoGridModel,
        IframeSectionModel
      ],
      assetsConfig: {
        referenceType: 'static',
        staticDir: '.',
        uploadDir: 'images',
        publicPath: '/'
      }
    })
  ]
});
